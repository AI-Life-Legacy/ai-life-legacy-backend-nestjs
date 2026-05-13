import { Injectable, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import {
  AIResponseDTO,
  ChatDTO,
  ChatResponseDTO,
  MakeReQuestionDTO,
  MakeCaseDTO,
  CaseResponseDTO,
  SyncDTO,
  SearchDTO,
  SearchResponseDTO,
  AutobiographyResponseDTO,
  AutobiographyStatusResponseDTO,
  MyAutobiographyStatusResponseDTO,
} from './dto/ai.dto';
import { LoggerService } from '../logger/logger.service';
import { SaveUserIntroductionRepository } from '../transaction/save-user-introduction.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutobiographyResult, AutobiographyStatus } from '../../db/entity/autobiography-result.entity';
import { LifeLegacyAnswer } from '../../db/entity/life-legacy-answer.entity';
import { User } from '../../db/entity/user.entity';
import { UserCaseRepository } from '../user-case/user-case.repository';
import * as crypto from 'crypto';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly apiKey: string;
  private readonly organization: string;
  private readonly activeAutobiographyGenerations = new Set<string>();
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly saveUserTransactionRepository: SaveUserIntroductionRepository,
    @InjectRepository(AutobiographyResult)
    private autobiographyResultRepository: Repository<AutobiographyResult>,
    @InjectRepository(LifeLegacyAnswer)
    private lifeLegacyAnswerRepository: Repository<LifeLegacyAnswer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userCaseRepository: UserCaseRepository,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.organization = this.configService.get<string>('OPENAI_ORGANIZATION');

    if (!this.apiKey) {
      // 키 없으면 OpenAI 클라이언트 안 만들고 그냥 비활성화 상태로 둠
      this.loggerService.warn('OPENAI_API_KEY not set; AiService is disabled in this environment.');
      return;
    }

    this.openai = new OpenAI({
      apiKey: this.apiKey,
      organization: this.organization,
    });
  }

  async caseClassification(makeCaseDTO: MakeCaseDTO, userId: string): Promise<CaseResponseDTO> {
    const response = await fetch('http://localhost:8000/api/v1/case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        introText: makeCaseDTO.data,
      }),
    });
    if (!response.ok) throw new Error(`AI Server Error: ${response.status}`);
    const result = await response.json();
    const userCase = result.case || 'case1';

    // AI 결과를 바탕으로 유저 목차 생성 및 저장
    await this.saveUserTransactionRepository.saveUserIntroduction(userCase, makeCaseDTO.data, userId);

    return { case: userCase };
  }

  async memorySync(syncDTO: SyncDTO, userId: string): Promise<void> {
    const response = await fetch('http://localhost:8000/api/v1/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        text: syncDTO.content,
      }),
    });
    if (!response.ok) throw new Error(`AI Server Error: ${response.status}`);
  }

  async generateQuestion(makeReQuestionDTO: MakeReQuestionDTO): Promise<AIResponseDTO> {
    const { question, data, tocId } = makeReQuestionDTO;

    console.log('[API/question frontend body]', makeReQuestionDTO);

    const aiPayload = {
      toc_id: tocId || 1,
      current_answer: data,
      chat_history: [
        {
          role: 'ai',
          content: question,
        },
        {
          role: 'user',
          content: data,
        },
      ],
    };

    console.log('[AI/question payload]', aiPayload);

    const response = await fetch('http://localhost:8000/api/v1/generation/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[AI/question error status]', response.status);
      console.log('[AI/question error data]', errorData);
      throw new Error(`AI Server Error: ${response.status}`);
    }

    const result = await response.json();
    const newQuestion = result.question;

    if (!newQuestion) {
      throw new Error('Invalid AI response: question not found');
    }

    return {
      question: newQuestion,
    };
  }

  private async calculateContentHash(userId: string): Promise<string> {
    const answers = await this.lifeLegacyAnswerRepository.find({
      where: { user: { uuid: userId } },
      relations: ['question'],
      order: { question: { id: 'ASC' } },
    });

    const concatenatedAnswers = answers.map((a) => a.answerText).join('|||');
    return crypto.createHash('sha256').update(concatenatedAnswers).digest('hex');
  }

  async generateAutobiography(userId: string, force: boolean = false): Promise<AutobiographyResponseDTO> {
    // 1. 사용자 및 사용자 케이스 정보 조회
    const user = await this.userRepository.findOne({
      where: { uuid: userId },
      relations: ['userCase'],
    });

    if (!user || !user.userCase) {
      throw new HttpException('사용자의 질문 케이스 정보가 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
    }

    // 2. 케이스 아이디를 기준으로 목차 및 질문 목록 조회
    const userCaseData = await this.userCaseRepository.findTocAndQuestionsCaseId(user.userCase.id);
    if (!userCaseData || !userCaseData.tocMappings || userCaseData.tocMappings.length === 0) {
      throw new HttpException('목차 정보가 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
    }

    // 3. 현재 로그인 사용자의 userId를 기준으로 모든 답변 데이터 조회
    const answers = await this.lifeLegacyAnswerRepository.find({
      where: { user: { uuid: userId } },
      relations: ['question', 'question.toc'],
      order: { question: { id: 'ASC' } },
    });

    // 4. 답변 및 모든 챕터 완료 검증
    // - 답변이 전혀 없으면 AI 서버 호출하지 말고 400 반환
    if (answers.length === 0) {
      throw new HttpException('작성된 답변이 전혀 없습니다.', HttpStatus.BAD_REQUEST);
    }

    // - 모든 챕터 답변이 완료되지 않았으면 400 반환
    const assignedQuestionIds = new Set<number>();
    for (const mapping of userCaseData.tocMappings) {
      if (mapping.toc && mapping.toc.questions) {
        for (const q of mapping.toc.questions) {
          assignedQuestionIds.add(q.id);
        }
      }
    }

    const answeredQuestionIds = new Set(answers.map((a) => a.question.id));
    let allAnswered = true;
    for (const qId of assignedQuestionIds) {
      if (!answeredQuestionIds.has(qId)) {
        allAnswered = false;
        break;
      }
    }

    if (!allAnswered) {
      throw new HttpException('모든 질문에 대한 답변이 완료되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }

    // 5. contentHash 기반 캐싱 적용를 위한 hash 계산
    const concatenatedAnswers = answers.map((a) => a.answerText).join('|||');
    const contentHash = crypto.createHash('sha256').update(concatenatedAnswers).digest('hex');

    let resultRecord = await this.autobiographyResultRepository.findOne({
      where: { userUuid: userId },
    });

    // 중복 요청 방지 (Lock & PROCESSING 상태 검사)
    if (this.activeAutobiographyGenerations.has(userId) || (resultRecord && resultRecord.status === AutobiographyStatus.PROCESSING)) {
      return {
        status: 'PROCESSING',
        cached: false,
        message: '자서전을 생성 중입니다.',
      };
    }

    // force=false 일 때의 캐싱 체크
    if (!force && resultRecord) {
      if (resultRecord.status === AutobiographyStatus.COMPLETED && resultRecord.contentHash === contentHash) {
        return {
          status: 'COMPLETED',
          cached: true,
          pdfUrl: resultRecord.pdfUrl,
          pageCount: resultRecord.pageCount || 42,
        };
      }
    }

    // 기존 COMPLETED 정보 기억 (재생성 실패 시 복원하기 위함)
    const hasExistingCompleted = resultRecord && resultRecord.status === AutobiographyStatus.COMPLETED;
    const prevPdfUrl = resultRecord ? resultRecord.pdfUrl : null;
    const prevPageCount = resultRecord ? resultRecord.pageCount : null;
    const prevContentHash = resultRecord ? resultRecord.contentHash : null;
    const prevCompletedAt = resultRecord ? resultRecord.completedAt : null;

    // 새 생성 또는 재생성 진행을 위한 DB 상태 업데이트 (PROCESSING)
    if (!resultRecord) {
      resultRecord = this.autobiographyResultRepository.create({
        userUuid: userId,
        user: { uuid: userId } as any,
        status: AutobiographyStatus.PROCESSING,
        contentHash,
      });
    } else {
      resultRecord.status = AutobiographyStatus.PROCESSING;
      resultRecord.contentHash = contentHash;
      resultRecord.errorMessage = null;
    }
    await this.autobiographyResultRepository.save(resultRecord);

    // active set에 등록 (메모리 락)
    this.activeAutobiographyGenerations.add(userId);

    // 6. AI 서버 요청을 위한 chapters 구성 (요청 body 예시 준수)
    const sortedMappings = [...userCaseData.tocMappings].sort((a, b) => a.orderIndex - b.orderIndex);
    const chaptersPayload = [];

    for (const mapping of sortedMappings) {
      if (mapping.toc) {
        const chapterQuestions = [];
        if (mapping.toc.questions) {
          for (const q of mapping.toc.questions) {
            const ans = answers.find((a) => a.question.id === q.id);
            if (ans) {
              chapterQuestions.push({
                question_id: q.id,
                question: q.questionText,
                answer: ans.answerText,
              });
            }
          }
        }
        chaptersPayload.push({
          toc_id: mapping.toc.id,
          title: mapping.toc.title,
          questions: chapterQuestions,
        });
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 360000); // 6 minutes timeout

      const requestBody = {
        user_id: userId,
        userName: '사용자',
        chapters: chaptersPayload,
        force,
      };

      const response = await fetch('http://localhost:8000/api/v1/generation/autobiography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorDetail = errorData.detail || JSON.stringify(errorData) || 'Unknown error';
        const errorMessage = `AI Server Error (${response.status}): ${errorDetail}`;

        resultRecord.status = AutobiographyStatus.FAILED;
        resultRecord.errorMessage = errorMessage;
        if (hasExistingCompleted) {
          // 재생성 실패 시 기존 완료 결과 복원
          resultRecord.pdfUrl = prevPdfUrl;
          resultRecord.pageCount = prevPageCount;
          resultRecord.contentHash = prevContentHash;
          resultRecord.completedAt = prevCompletedAt;
        }
        await this.autobiographyResultRepository.save(resultRecord);

        const status = [403, 429, 500].includes(response.status) ? response.status : HttpStatus.INTERNAL_SERVER_ERROR;

        let errorMsg = hasExistingCompleted
          ? '자서전 재제작에 실패했습니다. 기존 자서전은 유지됩니다.'
          : `자서전 생성에 실패했습니다: ${errorDetail}`;

        let detailCode = undefined;
        if (response.status === 429 || errorDetail.includes('insufficient_quota')) {
          errorMsg = 'insufficient_quota';
          detailCode = 'insufficient_quota';
        }

        if (hasExistingCompleted) {
          throw new HttpException(
            {
              status,
              message: errorMsg,
              detail: detailCode,
              result: {
                status: 'FAILED',
                existingPdfUrl: prevPdfUrl,
                existingPageCount: prevPageCount,
              },
            },
            status,
          );
        } else {
          throw new HttpException(
            {
              status,
              message: errorMsg,
              detail: detailCode,
            },
            status,
          );
        }
      }

      const result = await response.json();

      resultRecord.status = AutobiographyStatus.COMPLETED;
      resultRecord.pdfUrl = result.pdf_url || result.pdfUrl || result.pdfPath || '';
      resultRecord.pageCount = result.page_count || result.pageCount || 42;
      resultRecord.completedAt = new Date();
      await this.autobiographyResultRepository.save(resultRecord);

      return {
        status: 'COMPLETED',
        cached: false,
        pdfUrl: resultRecord.pdfUrl,
        pageCount: resultRecord.pageCount,
        markdown: result.mdPath || result.markdownPath || result.markdown || '',
        pdfPath: resultRecord.pdfUrl,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage = error.message || 'Unknown error';
      resultRecord.status = AutobiographyStatus.FAILED;
      resultRecord.errorMessage = errorMessage;
      if (hasExistingCompleted) {
        // 재생성 실패 시 기존 완료 결과 복원
        resultRecord.pdfUrl = prevPdfUrl;
        resultRecord.pageCount = prevPageCount;
        resultRecord.contentHash = prevContentHash;
        resultRecord.completedAt = prevCompletedAt;
      }
      await this.autobiographyResultRepository.save(resultRecord);

      if (hasExistingCompleted) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: '자서전 재제작에 실패했습니다. 기존 자서전은 유지됩니다.',
            result: {
              status: 'FAILED',
              existingPdfUrl: prevPdfUrl,
              existingPageCount: prevPageCount,
            },
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `자서전 생성 중 오류가 발생했습니다: ${errorMessage}`,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } finally {
      // 락 해제
      this.activeAutobiographyGenerations.delete(userId);
    }
  }

  async getMyAutobiographyStatus(userId: string): Promise<MyAutobiographyStatusResponseDTO> {
    const resultRecord = await this.autobiographyResultRepository.findOne({
      where: { userUuid: userId },
    });

    if (!resultRecord) {
      return {
        status: AutobiographyStatus.NOT_STARTED,
        cached: false,
      };
    }

    return {
      status: resultRecord.status,
      cached: resultRecord.status === AutobiographyStatus.COMPLETED,
      pdfUrl: resultRecord.pdfUrl || undefined,
      pageCount: resultRecord.pageCount || undefined,
      generatedAt: resultRecord.completedAt || resultRecord.updatedAt,
      errorMessage: resultRecord.errorMessage || undefined,
    };
  }

  async getAutobiographyStatus(tocId: number, userId: string): Promise<AutobiographyStatusResponseDTO> {
    const response = await fetch(`http://localhost:8000/api/v1/generation/autobiography/status/${userId}/${tocId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`AI Server Error: ${response.status}`);
    }
    return await response.json();
  }

  private mapRoleToId(roleId?: string, role?: string): string {
    if (roleId) {
      return roleId.trim();
    }
    if (role) {
      const trimmed = role.trim();
      if (trimmed === 'curator' || trimmed === '큐레이터') return 'curator';
      if (trimmed === 'father' || trimmed === '아버지') return 'father';
      if (trimmed === 'mother' || trimmed === '어머니') return 'mother';
      if (trimmed === 'self' || trimmed === '나') return 'self';
      return trimmed;
    }
    return 'curator';
  }

  async chat(chatDTO: ChatDTO, user: any): Promise<ChatResponseDTO> {
    const { message } = chatDTO;
    const isViewer = user.isViewer === true;
    const authorUserId = isViewer ? user.authorUserId : user.uuid;
    const viewerId = isViewer ? user.viewerCode : undefined;

    const mappedRoleId = this.mapRoleToId(chatDTO.role_id, chatDTO.role);
    const finalSessionId = chatDTO.session_id || `avatar_${isViewer ? 'viewer_' : ''}${authorUserId}_${Date.now()}`;

    const requestBody: any = {
      user_id: authorUserId,
      session_id: finalSessionId,
      role_id: mappedRoleId,
      message,
    };

    if (isViewer) {
      requestBody.viewer_id = viewerId;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    let response;
    try {
      response = await fetch('http://localhost:8000/api/v1/chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (err) {
      this.loggerService.warn(`AI Server connection failed or timed out: ${err.message}`);
      if (err.name === 'AbortError') {
        throw new HttpException('AI 서버 응답 시간이 초과되었습니다.', HttpStatus.GATEWAY_TIMEOUT);
      }
      throw new InternalServerErrorException('AI Server connection failed');
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      this.loggerService.warn(`AI Server Error (${response.status}): ${JSON.stringify(errorData)}`);

      if (response.status === 422) {
        throw new HttpException(
          {
            status: 422,
            message: '아바타 채팅 요청 형식이 올바르지 않습니다.',
            detail: errorData.detail || errorData,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      throw new HttpException(
        {
          status: response.status,
          message: 'AI 서버 통신 중 에러가 발생했습니다.',
          detail: errorData.detail || errorData,
        },
        response.status,
      );
    }

    const result = await response.json();

    if (!result || typeof result.answer === 'undefined') {
      throw new Error('Invalid AI response: answer field not found');
    }

    return {
      answer: result.answer,
      sessionId: result.session_id,
      contextUsed: result.context_used,
    };
  }

  async search(searchDTO: SearchDTO, userId: string): Promise<SearchResponseDTO> {
    const response = await fetch('http://localhost:8000/api/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        query: searchDTO.query,
      }),
    });
    if (!response.ok) throw new Error(`AI Server Error: ${response.status}`);
    const result = await response.json();
    return { results: result.results || [] };
  }

  async getChatGPTData(prompt: string, token: number) {
    // 키 없을 때, 서버 런타임 에러 없게
    if (!this.openai) {
      this.loggerService.warn('getChatGPTData called but AiService is disabled (no OPENAI_API_KEY).');
      throw new InternalServerErrorException('AI service is not configured.');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // OpenAI의 적절한 모델 사용
        messages: [{ role: 'user', content: prompt }],
        max_tokens: token,
      });

      return { content: response.choices[0]?.message.content };
    } catch (err) {
      this.loggerService.warn(`Chat GPT API Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }
}

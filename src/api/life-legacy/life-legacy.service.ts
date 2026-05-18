import { ConflictException, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { LifeLegacyRepository } from './life-legacy.repository';
import { LifeLegacyQuestionRepository } from '../life-legacy-question/life-legacy-question.repository';
import { SavePostDTO, ShareRequestDTO } from './dto/request/life-legacy.dto';
import { PdfResponseDTO, QuestionResponseDTO, ShareResponseDTO } from './dto/response/life-legacy.dto';
import { ViewerCodeRepository } from './viewer-code.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AutobiographyResult, AutobiographyStatus } from '../../db/entity/autobiography-result.entity';
import { Repository } from 'typeorm';
import { ViewerCodeStatus } from '../../db/entity/viewer-code.entity';

@Injectable()
export class LifeLegacyService {
  constructor(
    private lifeLegacyRepository: LifeLegacyRepository,
    private lifeLegacyQuestionRepository: LifeLegacyQuestionRepository,
    private viewerCodeRepository: ViewerCodeRepository,
    @InjectRepository(AutobiographyResult)
    private autobiographyResultRepository: Repository<AutobiographyResult>,
  ) {}

  async getQuestions(tocId: number, uuid: string): Promise<QuestionResponseDTO[]> {
    // 1. 해당 toc의 모든 질문 가져오기
    const allQuestions = await this.lifeLegacyQuestionRepository.findAllQuestionsByTocId(tocId);

    // 2. 유저가 작성한 모든 답변 가져오기
    const answers = await this.lifeLegacyRepository.findAllUserAnswersByUuid(uuid);

    // 3. 유저가 답변한 questionId 집합
    const answeredSet = new Set(answers.map((a) => a.question.id));

    // 4. allQuestions 중 answeredSet에 없는 것만 필터링
    const unansweredQuestions = allQuestions.filter((q) => !answeredSet.has(q.id));

    return unansweredQuestions.map((q) => new QuestionResponseDTO(q));
  }

  async saveUserTocQuestionAnswer(uuid: string, tocId: number, questionId: number, savePostDto: SavePostDTO) {
    const { answer } = savePostDto;

    const existResponse = await this.lifeLegacyRepository.findOneUserAnswerByUuidAndQuestionId(uuid, tocId, questionId);

    await this.lifeLegacyRepository.saveUserAnswer(uuid, questionId, answer, existResponse?.id);

    // AI Vector DB 자동 동기화 (RAG 싱크 유실을 원천 차단하여 언제나 로컬 및 클라우드 동기화 상태를 유지)
    try {
      const question = await this.lifeLegacyQuestionRepository.findOneQuestionById(questionId);
      const questionText = question ? question.questionText : '';
      const syncText = questionText ? `질문: ${questionText}\n답변: ${answer}` : answer;

      const aiServerUrl = 'http://localhost:8000';
      await fetch(`${aiServerUrl}/api/v1/rag/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uuid,
          text: syncText,
          metadata: {
            question_id: questionId,
            source: 'backend_save',
            type: 'user_answer',
          },
        }),
      });
      console.log(`[RAG Sync] Automatically synced answer for user ${uuid}, question ${questionId} to AI server.`);
    } catch (syncErr) {
      // 싱크 에러가 유저 답변 저장 자체를 방해하지 않도록 예외 처리 후 경고 로그만 남김
      console.warn(`[RAG Sync Warning] Failed to auto-sync answer to AI server: ${syncErr.message}`);
    }
  }

  async shareAutobiography(userId: string, tocId?: number): Promise<ShareResponseDTO> {
    // 1. 유저의 COMPLETED 자서전 결과 조회
    const result = await this.autobiographyResultRepository.findOne({
      where: { userUuid: userId, status: AutobiographyStatus.COMPLETED },
      order: { completedAt: 'DESC' },
    });

    if (!result) {
      throw new BadRequestException('아직 공유 가능한 자서전이 없습니다.');
    }

    if (!result.pdfUrl) {
      throw new BadRequestException('자서전 PDF URL이 존재하지 않습니다.');
    }

    // 2. 이미 ACTIVE 코드가 있는지 확인
    const existingActiveCode = await this.viewerCodeRepository.findActiveCodeByUserAndResult(userId, result.id);

    if (existingActiveCode) {
      // 기존 코드 만료 여부 확인
      if (new Date() < existingActiveCode.expiresAt) {
        return { viewerCode: existingActiveCode.viewerCode, expiresAt: existingActiveCode.expiresAt.toISOString() };
      }
    }

    // 3. 6자리 코드 생성 (대문자+숫자, 혼동하기 쉬운 문자 제외)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let viewerCode = '';
    for (let i = 0; i < 6; i++) {
      viewerCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 만료

    // 4. DB 저장
    const newCode = await this.viewerCodeRepository.saveViewerCode({
      viewerCode,
      authorUserUuid: userId,
      autobiographyResultId: result.id,
      pdfUrl: result.pdfUrl,
      status: ViewerCodeStatus.ACTIVE,
      expiresAt,
    });

    return { viewerCode: newCode.viewerCode, expiresAt: newCode.expiresAt.toISOString() };
  }

  async getPdfUrl(userId: string, tocId?: number): Promise<PdfResponseDTO> {
    const result = await this.autobiographyResultRepository.findOne({
      where: { userUuid: userId, status: AutobiographyStatus.COMPLETED },
      order: { completedAt: 'DESC' },
    });

    if (!result) {
      throw new NotFoundException('자서전 결과가 존재하지 않습니다.');
    }

    return {
      pdfUrl: result.pdfUrl,
      createdAt: result.completedAt?.toISOString() || result.updatedAt.toISOString(),
    };
  }

  async getViewerPdfUrl(viewerTokenPayload: any): Promise<PdfResponseDTO> {
    const { autobiographyResultId } = viewerTokenPayload;

    const result = await this.autobiographyResultRepository.findOne({
      where: { id: autobiographyResultId },
    });

    if (!result) {
      throw new NotFoundException('공유된 자서전 정보를 찾을 수 없습니다.');
    }

    return {
      pdfUrl: result.pdfUrl,
      createdAt: result.completedAt?.toISOString() || result.updatedAt.toISOString(),
    };
  }
}

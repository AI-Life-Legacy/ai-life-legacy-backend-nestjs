import { ConflictException, Injectable } from '@nestjs/common';
import { LifeLegacyRepository } from './life-legacy.repository';
import { LifeLegacyQuestionRepository } from '../life-legacy-question/life-legacy-question.repository';
import { SavePostDTO, ShareRequestDTO } from './dto/request/life-legacy.dto';
import { PdfResponseDTO, QuestionResponseDTO, ShareResponseDTO } from './dto/response/life-legacy.dto';

@Injectable()
export class LifeLegacyService {
  constructor(
    private lifeLegacyRepository: LifeLegacyRepository,
    private lifeLegacyQuestionRepository: LifeLegacyQuestionRepository,
  ) { }

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
  }

  async shareAutobiography(userId: string, tocId: number): Promise<ShareResponseDTO> {
    const viewerCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // TODO: DB 저장 로직 추가
    return { viewerCode, expiresAt: expiresAt.toISOString() };
  }

  async getPdfUrl(userId: string, tocId: number): Promise<PdfResponseDTO> {
    const pdfUrl = `https://s3.example.com/pdfs/${userId}_${tocId}.pdf`;
    const createdAt = new Date().toISOString();

    return { pdfUrl, createdAt };
  }
}

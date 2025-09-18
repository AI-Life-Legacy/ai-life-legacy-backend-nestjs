import { ConflictException, Injectable } from '@nestjs/common';
import { LifeLegacyRepository } from './life-legacy.repository';
import { LifeLegacyQuestionRepository } from '../life-legacy-question/life-legacy-question.repository';
import { SavePostDTO } from './dto/request/life-legacy.dto';
import { QuestionResponseDTO } from './dto/response/life-legacy.dto';

@Injectable()
export class LifeLegacyService {
  constructor(
    private lifeLegacyRepository: LifeLegacyRepository,
    private lifeLegacyQuestionRepository: LifeLegacyQuestionRepository,
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
    if (existResponse) throw new ConflictException('이미 작성한 질문입니다.');

    await this.lifeLegacyRepository.saveUserAnswer(uuid, questionId, answer);
  }
}

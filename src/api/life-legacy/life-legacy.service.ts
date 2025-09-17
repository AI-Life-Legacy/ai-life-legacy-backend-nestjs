import { ConflictException, Injectable } from '@nestjs/common';
import { SavePostDTO } from './dto/save.dto';
import { LifeLegacyRepository } from './life-legacy.repository';
import { LifeLegacyQuestionModule } from '../life-legacy-question/life-legacy-question.module';
import { LifeLegacyQuestionRepository } from '../life-legacy-question/life-legacy-question.repository';
import { UserCaseRepository } from '../user-case/user-case.repository';
import { UserService } from '../user/user.service';

@Injectable()
export class LifeLegacyService {
  constructor(
    private lifeLegacyRepository: LifeLegacyRepository,
    private lifeLegacyQuestionRepository: LifeLegacyQuestionRepository,
  ) {}

  async getQuestions(tocId: number, uuid: string) {
    // 1. 해당 toc의 모든 질문 가져오기
    const allQuestions = await this.lifeLegacyQuestionRepository.findAllQuestionsByTocId(tocId);

    // 2. 유저가 작성한 모든 답변 가져오기
    const answers = await this.lifeLegacyRepository.findAllUserAnswersByUuid(uuid);

    // 3. 유저가 답변한 questionId 집합
    const answeredSet = new Set(answers.map((a) => a.question.id));

    // 4. allQuestions 중 answeredSet에 없는 것만 필터링
    return allQuestions.filter((q) => !answeredSet.has(q.id));
  }

  async saveUserTocQuestionAnswer(uuid: string, tocId: number, questionId: number, savePostDto: SavePostDTO) {
    const { answer } = savePostDto;

    const existResponse = await this.lifeLegacyRepository.findOneUserAnswerByUuidAndQuestionId(uuid, tocId, questionId);
    if (existResponse) throw new ConflictException('이미 작성한 질문입니다.');

    return await this.lifeLegacyRepository.saveUserAnswer(uuid, questionId, answer);
  }
}

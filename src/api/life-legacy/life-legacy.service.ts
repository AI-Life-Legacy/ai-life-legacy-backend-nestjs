import { ConflictException, Injectable } from '@nestjs/common';
import { SavePostDTO } from './dto/save.dto';
import { LifeLegacyRepository } from './life-legacy.repository';

@Injectable()
export class LifeLegacyService {
  constructor(private lifeLegacyRepository: LifeLegacyRepository) {}

  async saveUserAnswer(uuid: string, savePostDto: SavePostDTO) {
    const { answer, questionId } = savePostDto;

    const existResponse = await this.lifeLegacyRepository.findUserAnswerByUuidAndQuestionId(uuid, questionId);
    if (existResponse) throw new ConflictException('이미 작성한 질문입니다.');

    return await this.lifeLegacyRepository.saveUserAnswer(uuid, questionId, answer);
  }
}

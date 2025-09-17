import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomInternalServerException } from '../../common/exception/exception';
import { LoggerService } from '../logger/logger.service';
import { LifeLegacyAnswer } from '../../db/entity/life-legacy-answer.entity';

export class LifeLegacyRepository {
  constructor(
    @InjectRepository(LifeLegacyAnswer)
    private lifeLegacyRepository: Repository<LifeLegacyAnswer>,
    private loggerService: LoggerService,
  ) {}

  async findOneUserAnswerByUuidAndQuestionId(uuid: string, tocId: number, questionId: number) {
    try {
      return await this.lifeLegacyRepository.findOne({
        where: {
          user: { uuid },
          question: {
            id: questionId,
            toc: { id: tocId },
          },
        },
      });
    } catch (err) {
      this.loggerService.warn(`Post/FindUserAnswerByUuidAndQuestionId Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }

  async findAllUserAnswersByUuid(uuid: string) {
    try {
      return await this.lifeLegacyRepository.find({
        where: {
          user: { uuid },
        },
        relations: ['question'],
      });
    } catch (err) {
      this.loggerService.warn(`Post/FindAllUserAnswersByUuid Error : ${err}`);
    }
  }

  async saveUserAnswer(uuid: string, questionId: number, answer: string) {
    try {
      return await this.lifeLegacyRepository.save({
        user: { uuid },
        question: { id: questionId },
        answerText: answer,
      });
    } catch (err) {
      this.loggerService.warn(`Post/saveUserAnswer Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }
}

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from '../logger/logger.service';
import { LifeLegacyAnswer } from '../../db/entity/life-legacy-answer.entity';
import { InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';

export class LifeLegacyRepository {
  constructor(
    @InjectRepository(LifeLegacyAnswer)
    private lifeLegacyRepository: Repository<LifeLegacyAnswer>,
    private loggerService: LoggerService,
  ) { }

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
      throw new InternalServerErrorException(err);
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
      throw new InternalServerErrorException(err);
    }
  }

  async saveUserAnswer(uuid: string, questionId: number, answer: string, answerId?: number) {
    try {
      return await this.lifeLegacyRepository.save({
        id: answerId,
        user: { uuid },
        question: { id: questionId },
        answerText: answer,
      });
    } catch (err) {
      this.loggerService.warn(`Post/saveUserAnswer Error : ${err}`);
      // Postgres: 23505 (Unique Violation), MySQL: ER_DUP_ENTRY (1062)
      if (err.code === '23505' || err.code === '1062') {
        throw new ConflictException('이미 작성한 질문입니다.');
      }
      // Postgres: 23503 (Foreign Key Violation), MySQL: ER_NO_REFERENCED_ROW (1452)
      if (err.code === '23503' || err.code === '1452') {
        throw new NotFoundException('해당 질문 또는 유저가 존재하지 않습니다.');
      }
      throw new InternalServerErrorException(err);
    }
  }
}

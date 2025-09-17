import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { Question } from '../../db/entity/question.entity';
import { CustomInternalServerException } from '../../common/exception/exception';

@Injectable()
export class LifeLegacyQuestionRepository {
  constructor(
    @InjectRepository(Question)
    private lifeLegacyRepository: Repository<Question>,
    private loggerService: LoggerService,
  ) {}

  async findAllQuestionsByTocId(tocId: number) {
    try {
      return await this.lifeLegacyRepository.find({
        where: {
          toc: { id: tocId },
        },
      });
    } catch (err) {
      this.loggerService.warn(`Life-Legacy/FindQuestionsByTocId Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }
}
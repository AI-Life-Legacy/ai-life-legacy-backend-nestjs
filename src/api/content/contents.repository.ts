import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contents } from '../../db/entity/contents.entity';
import { CustomInternalServerException } from '../../common/exception/exception';
import { LoggerService } from '../logger/logger.service';

export class ContentsRepository {
  constructor(
    @InjectRepository(Contents)
    private contentsRepository: Repository<Contents>,
    private readonly loggerService: LoggerService,
  ) {}

  async findQuestionsByContentsId(contentId: number) {
    try {
      return this.contentsRepository.findOne({
        where: {
          id: contentId,
        },
        relations: ['questions.question'],
      });
    } catch (err) {
      this.loggerService.warn(`Content/FindQuestionsByContentsId Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }
}

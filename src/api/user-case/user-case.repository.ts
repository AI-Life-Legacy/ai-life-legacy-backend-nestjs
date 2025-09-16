import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCase } from 'src/db/entity/user-case.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { CustomInternalServerException } from '../../common/exception/exception';

@Injectable()
export class UserCaseRepository {
  constructor(
    @InjectRepository(UserCase)
    private userCaseRepository: Repository<UserCase>,
    private readonly loggerService: LoggerService,
  ) {}

  async findCaseByCaseName(caseName: string) {
    try {
      return await this.userCaseRepository.findOne({
        where: { name: caseName },
      });
    } catch (err) {
      this.loggerService.warn(`User-Case/FindCaseByCaseName Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }

  async findTocAndQuestionsCaseId(caseId: number) {
    try {
      return await this.userCaseRepository.findOne({
        where: {
          id: caseId,
        },
        relations: ['tocMappings.toc', 'tocMappings.toc.questions'],
      });
    } catch (err) {
      this.loggerService.warn(`User-Case/FindCaseByCaseName Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }
}

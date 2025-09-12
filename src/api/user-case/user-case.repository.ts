import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async findContentsByCaseName(caseName: string) {
    try {
      return await this.userCaseRepository.findOne({
        where: { name: caseName },
        relations: ['contentMappings.content'],
      });
    } catch (err) {
      this.loggerService.warn(`User-Case/FindCaseByCaseName Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }
}

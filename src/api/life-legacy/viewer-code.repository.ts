import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewerCode, ViewerCodeStatus } from '../../db/entity/viewer-code.entity';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ViewerCodeRepository {
  constructor(
    @InjectRepository(ViewerCode)
    private viewerCodeRepository: Repository<ViewerCode>,
    private loggerService: LoggerService,
  ) {}

  async findActiveCodeByUserAndResult(userUuid: string, resultId: number) {
    try {
      return await this.viewerCodeRepository.findOne({
        where: {
          authorUserUuid: userUuid,
          autobiographyResultId: resultId,
          status: ViewerCodeStatus.ACTIVE,
        },
      });
    } catch (err) {
      this.loggerService.warn(`ViewerCode/FindActiveCode Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }

  async findByCode(viewerCode: string) {
    try {
      return await this.viewerCodeRepository.findOne({
        where: { viewerCode },
        relations: ['authorUser', 'autobiographyResult', 'authorUser.intros', 'authorUser.userCase'],
      });
    } catch (err) {
      this.loggerService.warn(`ViewerCode/FindByCode Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }

  async saveViewerCode(viewerCode: Partial<ViewerCode>) {
    try {
      return await this.viewerCodeRepository.save(viewerCode);
    } catch (err) {
      this.loggerService.warn(`ViewerCode/Save Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }
}

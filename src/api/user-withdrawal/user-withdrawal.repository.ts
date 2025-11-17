import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { UserWithdrawal } from '../../db/entity/user-withdrawal.entity';
import { WithdrawalReasonCode } from '../../common/enum/user-withdrawal.enum';

@Injectable()
export class UserWithdrawalRepository {
  constructor(
    @InjectRepository(UserWithdrawal)
    private userWithdrawalRepository: Repository<UserWithdrawal>,
    private readonly loggerService: LoggerService,
  ) {}

  async saveUserWithdrawal(uuid: string, withdrawalReason: WithdrawalReasonCode, withdrawalReasonText?: string | null) {
    try {
      return await this.userWithdrawalRepository.save({
        user: { uuid },
        reasonCode: withdrawalReason,
        reasonText: withdrawalReasonText,
      });
    } catch (err) {
      this.loggerService.warn(`User-Withdrawal/SaveUserWithdrawal Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }
}
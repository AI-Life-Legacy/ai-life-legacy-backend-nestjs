import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { WithdrawalReasonCode } from '../../common/enum/user-withdrawal.enum';
import { User } from '../../db/entity/user.entity';
import { UserWithdrawal } from '../../db/entity/user-withdrawal.entity';

@Injectable()
export class DeleteUserRepository {
  constructor(
    private dataSource: DataSource,
    private readonly loggerService: LoggerService,
  ) {}

  async deleteUser(uuid: string, withdrawalReason: WithdrawalReasonCode, withdrawalReasonText: string | null) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(User);
      const withdrawalRepo = queryRunner.manager.getRepository(UserWithdrawal);

      await withdrawalRepo.save({
        user: { uuid },
        reasonCode: withdrawalReason,
        reasonText: withdrawalReasonText,
      });

      await userRepo.softDelete({ uuid });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.loggerService.warn(`DeleteUser/DeleteUser Error : ${err}`);
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }
}
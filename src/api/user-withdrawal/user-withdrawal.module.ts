import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWithdrawal } from '../../db/entity/user-withdrawal.entity';
import { UserWithdrawalRepository } from './user-withdrawal.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserWithdrawal])],
  providers: [UserWithdrawalRepository],
  exports: [UserWithdrawalRepository],
})
export class UserWithdrawalModule {}

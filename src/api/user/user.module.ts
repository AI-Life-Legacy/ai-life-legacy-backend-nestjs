import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { UserCaseModule } from '../user-case/user-case.module';
import { LifeLegacyModule } from '../life-legacy/life-legacy.module';
import { User } from '../../db/entity/user.entity';
import { UserIntroModule } from '../user-intro/user-intro.module';
import { AiModule } from '../ai/ai.module';
import { UserWithdrawalModule } from '../user-withdrawal/user-withdrawal.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), LifeLegacyModule, UserCaseModule, UserIntroModule, AiModule, UserWithdrawalModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}

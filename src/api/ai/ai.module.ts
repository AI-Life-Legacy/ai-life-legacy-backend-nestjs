import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TransactionModule } from '../transaction/transaction.module';
import { AutobiographyResult } from '../../db/entity/autobiography-result.entity';
import { LifeLegacyAnswer } from '../../db/entity/life-legacy-answer.entity';
import { User } from '../../db/entity/user.entity';
import { UserCaseModule } from '../user-case/user-case.module';
import { UserIntroModule } from '../user-intro/user-intro.module';
import { AutobiographyFeedback } from '../../db/entity/autobiography-feedback.entity';

@Module({
  imports: [
    TransactionModule,
    UserCaseModule,
    UserIntroModule,
    TypeOrmModule.forFeature([AutobiographyResult, AutobiographyFeedback, LifeLegacyAnswer, User]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

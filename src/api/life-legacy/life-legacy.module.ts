import { Module } from '@nestjs/common';
import { LifeLegacyController } from './life-legacy.controller';
import { LifeLegacyService } from './life-legacy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LifeLegacyRepository } from './life-legacy.repository';
import { LifeLegacyAnswer } from '../../db/entity/life-legacy-answer.entity';
import { LifeLegacyQuestionModule } from '../life-legacy-question/life-legacy-question.module';
import { ViewerCode } from '../../db/entity/viewer-code.entity';
import { AutobiographyResult } from '../../db/entity/autobiography-result.entity';
import { ViewerCodeRepository } from './viewer-code.repository';
import { User } from '../../db/entity/user.entity';
import { UserIntroModule } from '../user-intro/user-intro.module';
import { UserCaseModule } from '../user-case/user-case.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LifeLegacyAnswer, ViewerCode, AutobiographyResult, User]),
    LifeLegacyQuestionModule,
    UserIntroModule,
    UserCaseModule,
  ],
  controllers: [LifeLegacyController],
  providers: [LifeLegacyService, LifeLegacyRepository, ViewerCodeRepository],
  exports: [LifeLegacyRepository, ViewerCodeRepository],
})
export class LifeLegacyModule {}

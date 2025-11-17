import { Module } from '@nestjs/common';
import { LifeLegacyController } from './life-legacy.controller';
import { LifeLegacyService } from './life-legacy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LifeLegacyRepository } from './life-legacy.repository';
import { LifeLegacyAnswer } from '../../db/entity/life-legacy-answer.entity';
import { LifeLegacyQuestionModule } from '../life-legacy-question/life-legacy-question.module';

@Module({
  imports: [TypeOrmModule.forFeature([LifeLegacyAnswer]), LifeLegacyQuestionModule],
  controllers: [LifeLegacyController],
  providers: [LifeLegacyService, LifeLegacyRepository],
  exports: [LifeLegacyRepository],
})
export class LifeLegacyModule {}

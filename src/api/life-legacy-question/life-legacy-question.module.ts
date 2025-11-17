import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../../db/entity/question.entity';
import { LifeLegacyQuestionRepository } from './life-legacy-question.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  providers: [LifeLegacyQuestionRepository],
  exports: [LifeLegacyQuestionRepository],
})
export class LifeLegacyQuestionModule {}

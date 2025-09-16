import { Module } from '@nestjs/common';
import { LifeLegacyController } from './life-legacy.controller';
import { LifeLegacyService } from './life-legacy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LifeLegacyRepository } from './life-legacy.repository';
import { LifeLegacyAnswer } from '../../db/entity/life-legacy-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LifeLegacyAnswer])],
  controllers: [LifeLegacyController],
  providers: [LifeLegacyService, LifeLegacyRepository],
  exports: [LifeLegacyRepository],
})
export class LifeLegacyModule {}

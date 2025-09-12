import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contents } from '../../db/entity/contents.entity';
import { ContentsRepository } from './contents.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Contents])],
  providers: [ContentsRepository],
  exports: [ContentsRepository],
})
export class ContentModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserIntro } from '../../db/entity/user-intro.entity';
import { UserIntroRepository } from './user-intro.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserIntro])],
  providers: [UserIntroRepository],
  exports: [UserIntroRepository],
})
export class UserIntroModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCase } from 'src/db/entity/user-case.entity';
import { UserCaseRepository } from './user-case.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserCase])],
  providers: [UserCaseRepository],
  exports: [UserCaseRepository],
})
export class UserCaseModule {}

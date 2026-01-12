import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthIdentity } from '../../db/entity/auth-identity.entity';
import { AuthIdentityRepository } from './auth-identity.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AuthIdentity])],
  providers: [AuthIdentityRepository],
  exports: [AuthIdentityRepository],
})
export class AuthIdentityModule {}

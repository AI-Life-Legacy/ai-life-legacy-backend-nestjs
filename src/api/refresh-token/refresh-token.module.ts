import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../../db/entity/refresh-token.entity';
import { RefreshTokenRepository } from './refresh-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  providers: [RefreshTokenRepository],
  exports: [RefreshTokenRepository],
})
export class RefreshTokenModule {}

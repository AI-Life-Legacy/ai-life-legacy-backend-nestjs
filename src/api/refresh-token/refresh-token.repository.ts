import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { RefreshToken } from '../../db/entity/refresh-token.entity';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly loggerService: LoggerService,
  ) {}

  async getValidRefreshTokenByUUID(uuid: string): Promise<RefreshToken | null> {
    try {
      return await this.refreshTokenRepository.findOne({
        where: {
          user: { uuid },
          expiresAt: MoreThan(new Date()), // 현재 시각보다 만료일이 뒤인 것만
        },
      });
    } catch (err) {
      this.loggerService.warn(`RefreshToken/GetValidRefreshTokenByUUID Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }

  async saveRefreshToken(uuid: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    try {
      return await this.refreshTokenRepository.save({
        user: { uuid },
        tokenHash,
        expiresAt,
      });
    } catch (err) {
      this.loggerService.warn(`RefreshToken/SaveRefreshToken Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }

  async updateRefreshToken(uuid: string, tokenHash: string, expiresAt: Date) {
    try {
      const token = this.refreshTokenRepository.create({
        user: { uuid },
        tokenHash,
        expiresAt,
      });

      return await this.refreshTokenRepository.save(token);
    } catch (err) {
      this.loggerService.warn(`RefreshToken/UpdateRefreshToken Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }
}

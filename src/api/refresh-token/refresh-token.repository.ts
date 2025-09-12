import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { RefreshToken } from '../../db/entity/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async getValidRefreshTokenByUUID(uuid: string): Promise<RefreshToken | null> {
    return await this.refreshTokenRepository.findOne({
      where: {
        user: { uuid },
        expiresAt: MoreThan(new Date()), // 현재 시각보다 만료일이 뒤인 것만
      },
    });
  }

  async saveRefreshToken(uuid: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    return await this.refreshTokenRepository.save({
      user: { uuid },
      tokenHash,
      expiresAt,
    });
  }

  async updateRefreshToken(uuid: string, tokenHash: string, expiresAt: Date) {
    const token = this.refreshTokenRepository.create({
      user: { uuid },
      tokenHash,
      expiresAt,
    });

    return await this.refreshTokenRepository.save(token);
  }
}

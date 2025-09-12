import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RedisCacheService {
  private readonly redisClient: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.redisClient = new Redis({
      host: configService.getOrThrow('REDIS_HOST'),
      port: configService.getOrThrow('REDIS_PORT'),
      // password: configService.getOrThrow('REDIS_PASSWORD'),
    });

    // Redis 연결 오류 로깅
    this.redisClient.on('error', (error) => {
      this.loggerService.warn(`❌ Redis Connection Error: ${error.message}`);
    });
  }

  async get(key: string) {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string) {
    return this.redisClient.set(key, value);
  }

  async delete(key: string) {
    return this.redisClient.del(key);
  }
}

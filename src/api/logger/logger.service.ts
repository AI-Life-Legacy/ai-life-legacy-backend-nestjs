import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'warn', // warn 레벨만 저장
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        }),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/warnings-%DATE%.log', // 날짜별 파일 생성
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true, // 오래된 로그 압축
          maxSize: '20m', // 최대 파일 크기
          maxFiles: '14d', // 14일 보관 후 삭제
          level: 'warn', // warn 레벨만 저장
        }),
      ],
    });
  }

  warn(message: string) {
    this.logger.warn(message);
  }
}

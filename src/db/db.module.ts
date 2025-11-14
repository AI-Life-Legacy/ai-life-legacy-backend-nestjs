import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // 🔹 환경 변수 로드 (.env, process.env)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ConfigModule을 가져옴
      inject: [ConfigService], // ConfigService를 주입받음
      useFactory: async (configService: ConfigService) => ({

        /* mySQL 설정 예시 
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/entity/*.entity{.ts,.js}'],
        synchronize: false, */

        // superbase 설정
        type: 'postgres',

        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT') ?? '6543'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/entity/*.entity{.ts,.js}'],
        synchronize: false,
        // Supabase는 SSL 필요
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
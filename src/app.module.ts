import { Module } from '@nestjs/common';
import { AiModule } from './api/ai/ai.module';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './api/auth/auth.module';
import { LifeLegacyModule } from './api/life-legacy/life-legacy.module';
import { AppController } from './app.controller';
import { UserCaseModule } from './api/user-case/user-case.module';
import { JwtModule } from './api/jwt/jwt.module';
import { DatabaseModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './api/logger/logger.module';
import { RefreshTokenModule } from './api/refresh-token/refresh-token.module';
import { AuthIdentityModule } from './api/auth-identity/auth-identity.module';
import { UserIntroModule } from './api/user-intro/user-intro.module';
import { UserWithdrawalModule } from './api/user-withdrawal/user-withdrawal.module';
import { LifeLegacyQuestionModule } from './api/life-legacy-question/life-legacy-question.module';
import { TransactionModule } from './api/transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    JwtModule,
    AuthModule,
    UserModule,
    AiModule,
    LifeLegacyModule,
    UserCaseModule,
    LoggerModule,
    RefreshTokenModule,
    AuthIdentityModule,
    UserIntroModule,
    UserWithdrawalModule,
    LifeLegacyQuestionModule,
    TransactionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

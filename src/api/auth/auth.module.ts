import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { AuthIdentityModule } from '../auth-identity/auth-identity.module';
import { TransactionModule } from '../transaction/transaction.module';
import { LifeLegacyModule } from '../life-legacy/life-legacy.module';

@Module({
  imports: [forwardRef(() => UserModule), RefreshTokenModule, AuthIdentityModule, TransactionModule, LifeLegacyModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

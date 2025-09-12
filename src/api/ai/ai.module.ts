import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

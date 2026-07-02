import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import { User } from '../../db/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private readonly loggerService: LoggerService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any) {
    if (payload.type === 'viewer') {
      return {
        isViewer: true,
        authorUserId: payload.authorUserId,
        autobiographyResultId: payload.autobiographyResultId,
        pdfUrl: payload.pdfUrl,
        viewerCode: payload.viewerCode,
      };
    }

    const { uuid } = payload;
    if (!uuid) {
      throw new NotFoundException('Invalid token payload');
    }

    const user: User = await this.userRepository.findOne({ where: { uuid } });
    if (!user) {
      this.loggerService.warn(`JWT/ Validate Error : User with UUID ${uuid} not found.`);
      throw new NotFoundException('Not Found User');
    }
    return user;
  }
}

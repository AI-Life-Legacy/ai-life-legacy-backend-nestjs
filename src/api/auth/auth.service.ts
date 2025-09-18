import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtTokenResponseDto, LoginDTO, RefreshTokenDto, SignupDTO } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import * as ms from 'ms';
import { AuthIdentityRepository } from '../auth-identity/auth-identity.repository';
import { Provider } from '../../common/enum/auth-identity.enum';
import { CreateUserRepository } from '../transaction/create-user.repository';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenRepository: RefreshTokenRepository,
    private authIdentityRepository: AuthIdentityRepository,
    private readonly loggerService: LoggerService,
    private transactionRepository: CreateUserRepository,
  ) {}

  private hashToken(token: string): string {
    return bcrypt.hashSync(token, 10);
  }

  private async compareToken(token: string, hashToken: string): Promise<boolean> {
    return bcrypt.compare(token, hashToken);
  }

  private generateAccessToken(payload: any): string {
    try {
      return this.jwtService.sign(payload);
    } catch (err) {
      this.loggerService.warn(`Auth/GenerateAccessToken Error: ${err.message}`);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  private generateRefreshToken(payload: any): { refreshToken: string; expiresAt: Date } {
    try {
      const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN');
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn,
      });
      const expiresAt = new Date(Date.now() + ms(expiresIn));
      return { refreshToken, expiresAt };
    } catch (err) {
      this.loggerService.warn(`Auth/GenerateRefreshToken Error: ${err.message}`);
      throw new InternalServerErrorException('Failed to generate refresh token');
    }
  }

  async signup(signupDTO: SignupDTO): Promise<JwtTokenResponseDto> {
    const { email, password } = signupDTO;

    const existingUser = await this.authIdentityRepository.findAuthIdentityByProviderUuid(email);
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserUuid = await this.transactionRepository.createUser(email, hashedPassword, Provider.local);

    const payload = { uuid: newUserUuid };
    const accessToken = this.generateAccessToken(payload);
    const { refreshToken, expiresAt } = this.generateRefreshToken(payload);

    await this.refreshTokenRepository.saveRefreshToken(newUserUuid, this.hashToken(refreshToken), expiresAt);

    return { accessToken, refreshToken };
  }

  async login(loginDTO: LoginDTO): Promise<JwtTokenResponseDto> {
    const { email, password } = loginDTO;

    const userAuthIdentity = await this.authIdentityRepository.findAuthIdentityByProviderUuid(email);
    if (!userAuthIdentity) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(password, userAuthIdentity.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { uuid: userAuthIdentity.user.uuid };
    const accessToken = this.generateAccessToken(payload);
    const { refreshToken, expiresAt } = this.generateRefreshToken(payload);

    // 항상 새로 발급 → DB에 업데이트
    await this.refreshTokenRepository.updateRefreshToken(userAuthIdentity.user.uuid, this.hashToken(refreshToken), expiresAt);

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (err) {
      this.loggerService.warn(`Auth/RefreshToken Error : ${err}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenRecord = await this.refreshTokenRepository.getValidRefreshTokenByUUID(payload.uuid);
    if (!tokenRecord) throw new UnauthorizedException('Refresh token not found or expired');

    const isMatch = await this.compareToken(refreshToken, tokenRecord.tokenHash);
    if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

    const newAccessToken = this.generateAccessToken({ uuid: payload.uuid });
    const { refreshToken: newRefreshToken, expiresAt } = this.generateRefreshToken({ uuid: payload.uuid });

    await this.refreshTokenRepository.updateRefreshToken(payload.uuid, this.hashToken(newRefreshToken), expiresAt);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

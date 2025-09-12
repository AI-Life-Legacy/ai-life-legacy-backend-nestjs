import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto, JwtTokenResponseDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/user.repository';
import { CustomConflictException, CustomNotFoundException, CustomUnauthorizedException } from '../../common/exception/exception';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  private hashToken(token: string): string {
    return bcrypt.hashSync(token, 10);
  }

  private async compareToken(token: string, hashToken: string): Promise<boolean> {
    return bcrypt.compare(token, hashToken);
  }

  private generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
    });
  }

  private generateRefreshToken(payload: any): { token: string; expiresAt: Date } {
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN');
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn,
    });
    const expiresAt = new Date(Date.now() + ms(expiresIn));
    return { token, expiresAt };
  }

  async signup(authCredentialsDto: AuthCredentialsDto): Promise<JwtTokenResponseDto> {
    const { email, password } = authCredentialsDto;

    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) throw new CustomConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.createAndSaveUserByEmailAndPassword(email, hashedPassword);

    const payload = { uuid: newUser.uuid };
    const accessToken = this.generateAccessToken(payload);
    const { token: refreshToken, expiresAt } = this.generateRefreshToken(payload);

    await this.refreshTokenRepository.saveRefreshToken(newUser.uuid, this.hashToken(refreshToken), expiresAt);

    return { accessToken, refreshToken };
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<JwtTokenResponseDto> {
    const { email, password } = authCredentialsDto;

    const user = await this.userRepository.findUserByEmail(email);
    if (!user) throw new CustomNotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new CustomUnauthorizedException('Invalid credentials');

    const payload = { uuid: user.uuid };
    const accessToken = this.generateAccessToken(payload);
    const { token: refreshToken, expiresAt } = this.generateRefreshToken(payload);

    // 항상 새로 발급 → DB에 업데이트
    await this.refreshTokenRepository.updateRefreshToken(user.uuid, this.hashToken(refreshToken), expiresAt);

    return { accessToken, refreshToken };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<JwtTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    });

    // DB의 해시값과 비교
    const tokenRecord = await this.refreshTokenRepository.getValidRefreshTokenByUUID(payload.uuid);
    if (!tokenRecord) throw new UnauthorizedException('Refresh token not found or expired');

    const isMatch = await this.compareToken(refreshToken, tokenRecord.tokenHash);
    if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

    // 새 토큰 발급
    const newAccessToken = this.generateAccessToken({ uuid: payload.uuid });
    const { token: newRefreshToken, expiresAt } = this.generateRefreshToken({ uuid: payload.uuid });

    await this.refreshTokenRepository.updateRefreshToken(payload.uuid, this.hashToken(newRefreshToken), expiresAt);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

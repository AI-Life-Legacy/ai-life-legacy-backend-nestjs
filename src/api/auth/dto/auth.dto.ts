import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @ApiProperty({ description: '유저 이메일', example: 'test@naver.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: '유저 비밀번호', example: '123456' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class JwtTokenResponseDto {
  @ApiProperty({ description: 'accessToken', example: 'accessToken' })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'refreshToken', example: 'refreshToken' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'refreshToken', example: 'refreshToken' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
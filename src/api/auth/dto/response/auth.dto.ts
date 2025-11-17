import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JwtTokenResponseDTO {
  @ApiProperty({ description: 'accessToken', example: 'accessToken' })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'refreshToken', example: 'refreshToken' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
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

export class ViewerLoginResponseDTO {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken: string;

  @ApiProperty({
    description: '작성자 정보',
    example: { name: '홍길동', intro: '안녕하세요, 홍길동입니다.' },
  })
  authorInfo: {
    name: string;
    intro: string;
  };
}
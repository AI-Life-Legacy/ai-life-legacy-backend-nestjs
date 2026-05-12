import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SavePostDTO {
  @ApiProperty({
    description: '사용자 최종 답변',
    example: '사용자 최종 답변',
  })
  @IsNotEmpty()
  @IsString()
  answer: string;
}

export class ShareRequestDTO {
  @ApiProperty({ description: '목차 ID', example: 1 })
  @IsNumber()
  tocId: number;
}
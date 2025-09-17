import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
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

export class PatchPostDTO {
  @ApiProperty({
    description: '사용자 최종 답변',
    example: '사용자 최종 답변',
  })
  @IsNotEmpty()
  @IsString()
  updateAnswer: string;

  @ApiProperty({
    description: '목차 id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  tocId: number;

  @ApiProperty({
    description: '질문 id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  questionId: number;
}

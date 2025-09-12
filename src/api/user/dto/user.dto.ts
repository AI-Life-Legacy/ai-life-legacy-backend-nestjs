import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetUserCaseDTO {
  @ApiProperty({ example: 'case1', description: '유저 케이스 이름' })
  @IsNotEmpty()
  @IsString()
  caseName: string;
}

export class UserCaseDTO {
  @ApiProperty({ description: '유저 케이스', example: 'case1' })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UserContentDTO {
  @ApiProperty({ description: '유저 목차 id', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ description: '유저 목차 내용', example: '탄생과 유아기 시절' })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UserQuestionDTO {
  @ApiProperty({ description: '유저 질문 id', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: '유저 질문 내용',
    example:
      '탄생과 유아기 시절언제 어디서 태어나셨나요? 탄생에 얽힌 이야기가 있나요? 부모님이나 가족들이 당신의 유아기에 대해 어떤 이야기를 해주셨나요?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;
}

export class UserContentAndQuestionsDTO {
  @ApiProperty({ description: '유저 목차 id', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ description: '유저 목차 내용', example: '탄생과 유아기 시절' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '유저 질문 내용 리스트',
    example: [
      {
        id: 1,
        question: '탄생과 유아기 시절',
      },
      {
        id: 2,
        question: '학창 시절에 가장 기억에 남는 순간은?',
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  questions: UserQuestionDTO[];
}

export class UserPostsDTO {
  @ApiProperty({ description: '유저 답변', example: '유저 답변' })
  @IsNotEmpty()
  @IsString()
  response: string;

  @ApiProperty({ description: '유저 목차 내용', example: '탄생과 유아기 시절' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '유저 질문 내용',
    example:
      '탄생과 유아기 시절언제 어디서 태어나셨나요? 탄생에 얽힌 이야기가 있나요? 부모님이나 가족들이 당신의 유아기에 대해 어떤 이야기를 해주셨나요?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;
}

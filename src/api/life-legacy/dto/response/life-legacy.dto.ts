import { Question } from '../../../../db/entity/question.entity';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionResponseDTO {
  @ApiProperty({
    example: 1,
    description: '질문 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: '당신의 어린 시절은 어땠나요?',
    description: '질문 본문',
  })
  questionText: string;

  constructor(question: Question) {
    this.id = question.id;
    this.questionText = question.questionText;
  }
}

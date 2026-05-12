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

export class ShareResponseDTO {
  @ApiProperty({ description: '뷰어 코드', example: 'A3F7K2' })
  viewerCode: string;
  @ApiProperty({ description: '만료 일시', example: '2026-05-18T18:22:16Z' })
  expiresAt: string;
}

export class PdfResponseDTO {
  @ApiProperty({ description: 'PDF URL', example: 'https://s3...' })
  pdfUrl: string;
  @ApiProperty({ description: '생성 일시', example: '2026-05-11T18:22:16Z' })
  createdAt: string;
}

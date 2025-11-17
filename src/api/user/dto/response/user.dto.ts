import { ApiProperty } from '@nestjs/swagger';
import { LifeLegacyAnswer } from '../../../../db/entity/life-legacy-answer.entity';

export class UserTocResponseDTO {
  @ApiProperty({ example: 1, description: 'TOC(목차)의 고유 ID' })
  tocId: number;

  @ApiProperty({ example: '가족 이야기', description: 'TOC(목차)의 제목' })
  tocTitle: string;

  @ApiProperty({ example: 10, description: 'TOC에 속한 전체 질문 개수' })
  totalQuestions: number;

  @ApiProperty({ example: 6, description: '사용자가 답변한 질문 개수' })
  answered: number;

  @ApiProperty({ example: 60, description: '답변 완료 비율 (%)' })
  percent: number;

  constructor(tocId: number, tocTitle: string, total: number, answered: number) {
    this.tocId = tocId;
    this.tocTitle = tocTitle;
    this.totalQuestions = total;
    this.answered = answered;
    this.percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  }
}

export class QuestionDTO {
  @ApiProperty({ example: 1, description: '질문 ID' })
  id: number;

  @ApiProperty({ example: '언제 어디서 태어나셨나요?', description: '질문 텍스트' })
  questionText: string;
}

export class TocWithQuestionsDTO {
  @ApiProperty({ example: 1, description: 'TOC ID' })
  tocId: number;

  @ApiProperty({ example: '탄생과 유아기 시절', description: 'TOC 제목' })
  tocTitle: string;

  @ApiProperty({ type: [QuestionDTO], description: '해당 TOC의 질문 리스트' })
  questions: QuestionDTO[];
}

export class UserAnswerResponseDTO {
  @ApiProperty({ example: 123, description: '답변 ID' })
  id: number;

  @ApiProperty({ example: '저는 1995년 서울에서 태어났습니다...', description: '답변 텍스트' })
  answerText: string;

  @ApiProperty({ example: 1, description: '질문 ID' })
  questionId: number;

  constructor(answer: LifeLegacyAnswer) {
    this.id = answer.id;
    this.answerText = answer.answerText;
    this.questionId = answer.question?.id;
  }
}
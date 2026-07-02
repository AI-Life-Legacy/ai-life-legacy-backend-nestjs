import { ApiProperty } from '@nestjs/swagger';
import { LifeLegacyAnswer } from '../../../../db/entity/life-legacy-answer.entity';

export class UserChapterDTO {
  @ApiProperty({ example: 1, description: 'TOC(목차)의 고유 ID' })
  tocId: number;

  @ApiProperty({ example: '어린 시절과 첫 기억', description: 'TOC(목차)의 제목' })
  title: string;

  @ApiProperty({ example: 0, description: '답변 완료 질문 개수' })
  done: number;

  @ApiProperty({ example: 8, description: '전체 질문 개수' })
  total: number;

  @ApiProperty({ example: 'not-started', description: '진행 상태 (not-started, in-progress, completed)' })
  status: string;

  @ApiProperty({ example: 0, description: '답변 완료 비율 (%)' })
  percent: number;
}

export class UserTocResultDTO {
  @ApiProperty({ example: 7, description: '전체 챕터 개수' })
  totalChapters: number;

  @ApiProperty({ example: 0, description: '완료된 챕터 개수' })
  completedChapters: number;

  @ApiProperty({ example: 0, description: '전체 진행률 (%)' })
  progressPercent: number;

  @ApiProperty({ type: [UserChapterDTO], description: '챕터 목록' })
  chapters: UserChapterDTO[];
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

import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MakeCaseDTO {
  @ApiProperty({
    description: '유저의 자기소개 데이터',
    example:
      '안녕 나는 서울에 살고있는 홍길동이라고해.\n' +
      '나는 남자고 55살이야. 나는 00고등학교를 졸업했고, 00일을 하고 있어.\n' +
      '결혼한 지 23년차야. 나는 5살 아들과 3살 딸이 있어.',
  })
  @IsString()
  data: string;
}

export class SyncDTO {
  @ApiProperty({
    description: '유저의 답변, 일기, 또는 외부 연동 텍스트',
    example: '오늘 나는 아내와 함께 속초 바다를 보러 갔다. 아주 즐거운 하루였다.',
  })
  @IsString()
  content: string;
}

export class MakeReQuestionDTO {
  @ApiProperty({
    description: '목차 ID (선택)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  tocId?: number;

  @ApiProperty({
    description: '1차 질문',
    example: '언제 어디서 태어나셨나요? 탄생에 얽힌 이야기가 있나요? 부모님이나 가족들이 당신의 유아기에 대해 어떤 이야기를 해주셨나요?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: '사용자 1차 답변',
    example:
      "저는 2002년 5월 15일, 대한민국 서울에서 태어났습니다. 부모님께서는 제가 태어난 날을 '가장 행복한 날'이라고 말씀하시곤 합니다. 어머니는 출산 예정일보다 조금 일찍 태어나서 걱정하셨지만, 건강하게 태어나 다행이었다고 하셨어요. 아버지는 제가 태어난 순간을 정확히 기억하시면서, '처음 본 순간 너무 작고 소중해서 눈물이 났다'고 이야기해 주셨습니다.",
  })
  @IsString()
  data: string;
}

export class CombineDTO {
  @ApiProperty({
    description: '1차 질문',
    example: '언제 어디서 태어나셨나요? 탄생에 얽힌 이야기가 있나요? 부모님이나 가족들이 당신의 유아기에 대해 어떤 이야기를 해주셨나요?',
  })
  @IsString()
  question1: string;

  @ApiProperty({
    description: '사용자 1차 답변',
    example:
      "저는 2002년 5월 15일, 대한민국 서울에서 태어났습니다. 부모님께서는 제가 태어난 날을 '가장 행복한 날'이라고 말씀하시곤 합니다. 어머니는 출산 예정일보다 조금 일찍 태어나서 걱정하셨지만, 건강하게 태어나 다행이었다고 하셨어요. 아버지는 제가 태어난 순간을 정확히 기억하시면서, '처음 본 순간 너무 작고 소중해서 눈물이 났다'고 이야기해 주셨습니다.",
  })
  @IsString()
  data1: string;

  @ApiProperty({
    description: '2차 질문',
    example: '어머니께서는 출산 예정일보다 일찍 태어나서 걱정하셨다고 하셨는데, 그 당시 어떤 일이 있었는지 더 들려주실 수 있나요?',
  })
  @IsString()
  question2: string;

  @ApiProperty({
    description: '사용자 2차 답변',
    example:
      '어머니께서는 원래 6월 초가 출산 예정일이었는데, 제가 5월 15일에 조금 일찍 태어났다고 하셨어요. 그래서 갑작스럽게 진통이 와서 병원으로 가는 길이 굉장히 긴장되었다고 하셨습니다. 특히, 새벽에 진통이 시작되어 급하게 병원에 갔는데, 예상보다 빨리 분만실로 들어가게 되어서 마음의 준비를 제대로 할 틈도 없었다고 해요 ',
  })
  @IsString()
  data2: string;
}

export class ChatDTO {
  @ApiProperty({
    description: '채팅 메시지',
    example: '안녕하세요',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: '채팅 역할 한글 또는 영문명 (선택)',
    example: '큐레이터',
    required: false,
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: '역할 ID (선택). 기본값 "curator"',
    example: 'curator',
    required: false,
  })
  @IsString()
  @IsOptional()
  role_id?: string;

  @ApiProperty({
    description: '세션 ID (선택)',
    example: 'session_123',
    required: false,
  })
  @IsString()
  @IsOptional()
  session_id?: string;
}

export class ChatResponseDTO {
  @ApiProperty({ description: '아바타 응답', example: '아바타 응답' })
  @IsString()
  answer: string;

  @ApiProperty({ description: '세션 ID', example: 'session-id' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: '컨텍스트 사용 여부', example: true })
  contextUsed: boolean;
}

export class AutobiographyStatusResponseDTO {
  @ApiProperty({ description: '진행 상태', example: 'PROCESSING' })
  @IsString()
  status: string;

  @ApiProperty({ description: '진행률', example: 50 })
  progress: number;

  @ApiProperty({ description: '메시지', example: 'PDF 생성 중입니다.' })
  @IsString()
  message: string;
}

export class AIResponseDTO {
  @ApiProperty({ description: 'AI 메시지', example: '안녕하세요' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: '생성된 질문', example: '꼬리 질문입니다.', required: false })
  @IsString()
  @IsOptional()
  question?: string;
}

export class CaseResponseDTO {
  @ApiProperty({ description: '분류된 케이스 (case1 ~ case6)', example: 'case1' })
  @IsString()
  case: string;
}

export class SearchDTO {
  @ApiProperty({ description: '검색어', example: '바다' })
  @IsString()
  query: string;
}

export class SearchResultDTO {
  @ApiProperty({ description: '검색된 원문', example: '오늘 바다에 다녀왔다.' })
  @IsString()
  content: string;
}

export class SearchResponseDTO {
  @ApiProperty({ description: '검색 결과 배열', type: [SearchResultDTO] })
  results: SearchResultDTO[];
}

export class AutobiographyResponseDTO {
  @ApiProperty({ description: '생성 상태', example: 'COMPLETED' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: '캐시 사용 여부', example: true })
  @IsOptional()
  cached?: boolean;

  @ApiProperty({ description: '생성된 PDF 파일 URL', example: '/pdfs/user_abc123.pdf' })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @ApiProperty({ description: '생성된 마크다운 파일 내용 또는 경로', example: '# 나의 자서전...' })
  @IsString()
  @IsOptional()
  markdown?: string;

  @ApiProperty({ description: '앱 내 전자책 리더에서 사용할 마크다운 파일 URL', example: '/storage/data/user.md' })
  @IsString()
  @IsOptional()
  markdownUrl?: string;

  @ApiProperty({ description: '생성된 PDF 파일 경로 (Legacy)', example: '/pdfs/user_abc123.pdf' })
  @IsString()
  @IsOptional()
  pdfPath?: string;

  @ApiProperty({ description: '총 페이지 수', example: 42 })
  @IsNumber()
  @IsOptional()
  pageCount?: number;

  @ApiProperty({ description: '메시지', example: '자서전을 생성 중입니다.' })
  @IsString()
  @IsOptional()
  message?: string;
}

export class GenerateAutobiographyRequestDTO {
  @ApiProperty({ description: 'Selected PDF design template', example: 'classic', required: false })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiProperty({ description: 'Legacy PDF theme alias', example: 'classic', required: false })
  @IsString()
  @IsOptional()
  theme?: string;
}

export class AutobiographyFeedbackRequestDTO {
  @ApiProperty({ description: '자서전 만족도 점수', example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: '아쉬운 점 또는 개선 방향 태그',
    example: ['내용을 더 자세히', '더 감성적으로'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  feedbackTags?: string[];

  @ApiProperty({ description: '사용자 자유 의견', example: '가족 이야기를 조금 더 넣고 싶어요.', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: '이 피드백을 바탕으로 재생성하고 싶은지 여부', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  wantsRegeneration?: boolean;
}

export class AutobiographyFeedbackResponseDTO {
  @ApiProperty({ description: '저장된 평가 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '자서전 만족도 점수', example: 4 })
  rating: number;

  @ApiProperty({ description: '아쉬운 점 또는 개선 방향 태그', example: ['내용을 더 자세히', '더 감성적으로'], type: [String] })
  feedbackTags: string[];

  @ApiProperty({ description: '사용자 자유 의견', example: '가족 이야기를 조금 더 넣고 싶어요.', required: false })
  comment?: string;

  @ApiProperty({ description: '이 피드백을 바탕으로 재생성하고 싶은지 여부', example: true })
  wantsRegeneration: boolean;
}

export class MyAutobiographyStatusResponseDTO {
  @ApiProperty({ description: '생성 상태', example: 'COMPLETED' })
  @IsString()
  status: string;

  @ApiProperty({ description: '캐시 사용 여부', example: true })
  cached: boolean;

  @ApiProperty({ description: '생성된 PDF 파일 URL', example: '/pdfs/user_abc123.pdf', required: false })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @ApiProperty({ description: '총 페이지 수', example: 25, required: false })
  @IsNumber()
  @IsOptional()
  pageCount?: number;

  @ApiProperty({ description: '앱 내 전자책 리더에서 사용할 마크다운 파일 URL', example: '/storage/data/user.md', required: false })
  @IsString()
  @IsOptional()
  markdownUrl?: string;

  @ApiProperty({ description: '생성 완료 일시', example: '2026-05-12T13:00:29.000Z', required: false })
  @IsOptional()
  generatedAt?: Date | string;

  @ApiProperty({ description: '에러 메시지', example: 'Error occurred', required: false })
  @IsString()
  @IsOptional()
  errorMessage?: string;
}

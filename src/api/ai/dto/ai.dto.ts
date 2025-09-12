import { IsString } from 'class-validator';
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

export class MakeReQuestionDTO {
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

export class AIResponseDTO {
  @ApiProperty({ description: 'AIResponse', example: 'AIResponse' })
  @IsString()
  content: string;
}

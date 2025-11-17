import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WithdrawalReasonCode } from '../../../../common/enum/user-withdrawal.enum';

export class SetUserCaseDTO {
  @ApiProperty({ example: 'case1', description: '유저 케이스 이름' })
  @IsNotEmpty()
  @IsString()
  caseName: string;
}

export class SaveUserIntroDTO {
  @ApiProperty({ description: '유저 자기소개', example: '~~~' })
  @IsNotEmpty()
  @IsString()
  userIntroText: string;
}

export class SaveUserWithdrawalDTO {
  @ApiProperty({ description: '탈퇴 이유', example: '~~~' })
  @IsNotEmpty()
  @IsString()
  withdrawalReason: WithdrawalReasonCode;

  @ApiProperty({ description: '기타 선택시 텍스트 작성', example: '~~~' })
  @IsNotEmpty()
  @IsString()
  withdrawalText: string;
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
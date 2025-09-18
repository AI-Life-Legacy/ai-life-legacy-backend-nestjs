import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuccessResponseDTO<T> {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 200,
  })
  status: number;

  @ApiProperty({
    description: '성공 메시지',
    example: 'Success',
  })
  message: string;

  @ApiPropertyOptional({ description: '응답 데이터' })
  result?: T;

  constructor(result?: T, status = 200, message = 'Success') {
    this.status = status;
    this.message = message;
    this.result = result;
  }
}
export class Success201ResponseDTO<T> {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 201,
  })
  status: number;

  @ApiProperty({
    description: '성공 메시지',
    example: 'Success',
  })
  message: string;

  @ApiPropertyOptional({ description: '응답 데이터' })
  result?: T;

  constructor(result?: T, status = 201, message = 'Success') {
    this.status = status;
    this.message = message;
    this.result = result;
  }
}

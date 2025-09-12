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
export class Success204ResponseDTO {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 204,
  })
  status: number;

  @ApiProperty({
    description: '성공 메시지',
    example: 'Success',
  })
  message: string;

  constructor() {
    this.message = 'Success'; // 기본 메시지 "Success"를 제공
    this.status = 204;
  }
}

export class BadRequestResponseDTO {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400,
  })
  status: number;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Bad Request',
  })
  message: string;

  constructor(message: string = 'Bad Request') {
    this.message = message;
    this.status = 400;
  }
}
export class UnauthorizedResponseDTO {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 401,
  })
  status: number;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Unauthorized',
  })
  message: string;

  constructor(message: string = 'Unauthorized') {
    this.message = message;
    this.status = 401;
  }
}

export class NotFoundResponseDTO {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 404,
  })
  status: number;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Not Found',
  })
  message: string;

  constructor(message: string = 'Not Found') {
    this.message = message;
    this.status = 404;
  }
}

export class ConflictResponseDTO {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 409,
  })
  status: number;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Conflict',
  })
  message: string;

  constructor(message: string = 'Conflict') {
    this.message = message;
    this.status = 409;
  }
}


export class InternalServerResponseDTO {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 500,
  })
  status: number;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Internal Server Error',
  })
  message: string;

  constructor(message: string = 'Internal Server Error') {
    this.message = message;
    this.status = 500;
  }
}
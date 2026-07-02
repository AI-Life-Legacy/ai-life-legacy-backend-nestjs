import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../../api/logger/logger.service';

@Catch() // 모든 예외를 잡음
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500; // 기본적으로 Internal Server Error
    let message = 'Internal Server Error';
    let detail: any = undefined;
    let result: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        detail = (exceptionResponse as any).detail;
        result = (exceptionResponse as any).result;

        // ValidationPipe 등에서 던진 배열 형태의 message를 처리하기 위해
        if (Array.isArray((exceptionResponse as any).message)) {
          message = (exceptionResponse as any).message.join(', ');
          detail = (exceptionResponse as any).message;
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      // 일반적인 런타임 오류 처리
      message = exception.message;
    }

    if (status != 404) {
      this.loggerService.warn(
        `[${request.method}] ${request.url} - Status: ${status}, Message: ${message}, Detail: ${
          typeof detail === 'object' ? JSON.stringify(detail) : detail
        }`,
      );
    }

    const responseBody: any = {
      status: status,
      message: message,
    };

    if (detail !== undefined) {
      responseBody.detail = detail;
    }

    if (result !== undefined) {
      responseBody.result = result;
    }

    response.status(status).json(responseBody);
  }
}

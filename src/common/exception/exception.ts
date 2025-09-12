import { HttpException, HttpStatus } from '@nestjs/common';

// ✅ 401 Unauthorized
export class CustomUnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

// ✅ 403 Forbidden
export class CustomForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

// ✅ 404 Not Found
export class CustomNotFoundException extends HttpException {
  constructor(message: string = 'Not Found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

// ✅ 409 Conflict
export class CustomConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super(message, HttpStatus.CONFLICT);
  }
}

// ✅ 500 Internal Server Error
export class CustomInternalServerException extends HttpException {
  constructor(message: string = 'Internal Server Error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

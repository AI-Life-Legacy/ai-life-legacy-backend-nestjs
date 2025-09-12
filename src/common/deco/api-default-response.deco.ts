import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { BadRequestResponseDTO, InternalServerResponseDTO, NotFoundResponseDTO, UnauthorizedResponseDTO } from 'src/common/response/response.dto';

export function ApiDefaultResponses() {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Bad request', type: BadRequestResponseDTO }),
    ApiUnauthorizedResponse({ description: 'Unauthorized', type: UnauthorizedResponseDTO }),
    ApiNotFoundResponse({ description: 'Not Found', type: NotFoundResponseDTO }),
    ApiInternalServerErrorResponse({ description: 'Internal Server Error', type: InternalServerResponseDTO }),
  );
}

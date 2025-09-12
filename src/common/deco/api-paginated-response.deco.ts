import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Success201ResponseDTO, Success204ResponseDTO, SuccessResponseDTO } from '../response/response.dto';

export const ApiSuccessResponse = <TModel extends Type<any>>(model: TModel, isArray = false) => {
  return applyDecorators(
    ApiExtraModels(SuccessResponseDTO, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDTO) },
          {
            properties: {
              result: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(model) } } // ✅ 배열 처리
                : { $ref: getSchemaPath(model) }, // ✅ 단일 객체 처리
            },
          },
        ],
      },
    }),
  );
};

export const ApiSuccess201Response = <TModel extends Type<any>>(model: TModel, isArray = false) => {
  return applyDecorators(
    ApiExtraModels(Success201ResponseDTO, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(Success201ResponseDTO) },
          {
            properties: {
              result: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(model) } } // ✅ 배열 처리
                : { $ref: getSchemaPath(model) }, // ✅ 단일 객체 처리
            },
          },
        ],
      },
    }),
  );
};

export const ApiSuccess204Response = applyDecorators(
  ApiExtraModels(Success204ResponseDTO),
  ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(Success204ResponseDTO) }],
    },
  }),
);

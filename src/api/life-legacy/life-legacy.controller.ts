import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { LifeLegacyService } from './life-legacy.service';
import { SuccessNoResultResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { GetUUID } from '../../common/deco/get-user.decorator';
import { SavePostDTO } from './dto/request/life-legacy.dto';
import { QuestionResponseDTO } from './dto/response/life-legacy.dto';

@Controller('life-legacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LifeLegacyController {
  constructor(private lifeLegacyService: LifeLegacyService) {}

  @Get('/toc/:tocId/questions')
  @ApiOperation({ summary: '유저 목차별 질문 불러오기 API' })
  @ApiExtraModels(SuccessResponseDTO, QuestionResponseDTO)
  @ApiOkResponse({
    description: '불러오기 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDTO) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(QuestionResponseDTO) },
            },
          },
        },
      ],
    },
  })
  async getQuestions(@Param('tocId', ParseIntPipe) tocId: number, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.lifeLegacyService.getQuestions(tocId, uuid));
  }

  @Post('/toc/:tocId/questions/:questionId/answers')
  @ApiOperation({ summary: '유저 목차별 각 질문 최종 결과물 저장하기 API' })
  @ApiOkResponse({ description: '최근 검색 기록 삭제 성공', type: SuccessNoResultResponseDTO })
  async saveUserTocQuestionAnswer(
    @Param('tocId', ParseIntPipe) tocId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() savePostDTO: SavePostDTO,
    @GetUUID() uuid: string,
  ) {
    await this.lifeLegacyService.saveUserTocQuestionAnswer(uuid, tocId, questionId, savePostDTO);
    return new SuccessNoResultResponseDTO();
  }
}

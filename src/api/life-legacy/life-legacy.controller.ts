import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards, Request } from '@nestjs/common';
import { LifeLegacyService } from './life-legacy.service';
import { SuccessNoResultResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { GetUUID } from '../../common/deco/get-user.decorator';
import { SavePostDTO, ShareRequestDTO } from './dto/request/life-legacy.dto';
import { PdfResponseDTO, QuestionResponseDTO, ShareResponseDTO } from './dto/response/life-legacy.dto';
import { WriterOnlyGuard, ViewerOnlyGuard } from '../jwt/role.guard';

@Controller('life-legacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LifeLegacyController {
  constructor(private lifeLegacyService: LifeLegacyService) {}

  @Get('/toc/:tocId/questions')
  @UseGuards(WriterOnlyGuard)
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
  @UseGuards(WriterOnlyGuard)
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

  @Post('/share')
  @UseGuards(WriterOnlyGuard)
  @ApiOperation({ summary: '자서전 공유용 뷰어 코드 발급 API' })
  @ApiOkResponse({ description: '코드 발급 성공', type: ShareResponseDTO })
  async shareAutobiography(@Body() shareRequestDTO: ShareRequestDTO, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.lifeLegacyService.shareAutobiography(uuid, shareRequestDTO.tocId));
  }

  @Get('/pdf/:tocId')
  @UseGuards(WriterOnlyGuard)
  @ApiOperation({ summary: '최종 완성된 PDF URL 조회 API' })
  @ApiOkResponse({ description: 'URL 조회 성공', type: PdfResponseDTO })
  async getPdfUrl(@Param('tocId', ParseIntPipe) tocId: number, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.lifeLegacyService.getPdfUrl(uuid, tocId));
  }

  @Get('/viewer/pdf')
  @UseGuards(ViewerOnlyGuard)
  @ApiOperation({ summary: '뷰어용 공유 PDF URL 조회 API' })
  @ApiOkResponse({ description: 'URL 조회 성공', type: PdfResponseDTO })
  async getViewerPdfUrl(@Request() req) {
    return new SuccessResponseDTO(await this.lifeLegacyService.getViewerPdfUrl(req.user));
  }
}

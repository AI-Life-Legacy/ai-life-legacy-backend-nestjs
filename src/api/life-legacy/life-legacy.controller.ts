import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { LifeLegacyService } from './life-legacy.service';
import { SavePostDTO } from './dto/save.dto';
import { Success204ResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GetUUID } from '../../common/deco/get-user.decorator';

@Controller('life-legacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LifeLegacyController {
  constructor(private lifeLegacyService: LifeLegacyService) {}

  @Get('/toc/:tocId/questions')
  @ApiOperation({ summary: '유저 목차별 질문 불러오기 API' })
  async getQuestions(@Param('tocId', ParseIntPipe) tocId: number, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.lifeLegacyService.getQuestions(tocId, uuid));
  }

  @Post('/toc/:tocId/questions/:questionId/answers')
  @ApiOperation({ summary: '유저 목차별 각 질문 최종 결과물 저장하기 API' })
  async saveUserTocQuestionAnswer(
    @Param('tocId', ParseIntPipe) tocId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() savePostDTO: SavePostDTO,
    @GetUUID() uuid: string,
  ) {
    await this.lifeLegacyService.saveUserTocQuestionAnswer(uuid, tocId, questionId, savePostDTO);
    return new Success204ResponseDTO();
  }
}

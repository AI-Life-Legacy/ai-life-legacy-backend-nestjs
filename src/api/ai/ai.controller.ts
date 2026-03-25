import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { combinePrompt } from 'src/common/prompt/combine.prompt';
import { AIResponseDTO, ChatDTO, CombineDTO, MakeReQuestionDTO, MakeCaseDTO, SyncDTO, SearchDTO, SearchResponseDTO, AutobiographyResponseDTO, CaseResponseDTO } from './dto/ai.dto';
import { SuccessNoResultResponseDTO, SuccessResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/deco/api-paginated-response.deco';
import { GetUUID } from '../../common/deco/get-user.decorator';

@Controller('api')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('/case')
  @ApiOperation({ summary: '유저 케이스 분류 API' })
  @ApiSuccessResponse(CaseResponseDTO)
  async caseClassification(@Body() makeCaseDTO: MakeCaseDTO, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.aiService.caseClassification(makeCaseDTO, uuid));
  }

  @Post('/sync')
  @ApiOperation({ summary: '기억 동기화 API' })
  @ApiOkResponse({ description: '성공', type: SuccessNoResultResponseDTO })
  async memorySync(@Body() syncDTO: SyncDTO, @GetUUID() uuid: string) {
    await this.aiService.memorySync(syncDTO, uuid);
    return new SuccessNoResultResponseDTO();
  }

  @Post('/question')
  @ApiOperation({ summary: '꼬리 질문 생성 API' })
  @ApiSuccessResponse(AIResponseDTO)
  async makeReQuestion(@Body() makeReQuestionDTO: MakeReQuestionDTO, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.aiService.generateQuestion(makeReQuestionDTO, uuid));
  }

  @Post('/autobiography')
  @ApiOperation({ summary: '자서전 제작 및 PDF 발행 API' })
  @ApiSuccessResponse(AutobiographyResponseDTO)
  async generateAutobiography(@GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.aiService.generateAutobiography(uuid));
  }

  @Post('/chat')
  @ApiOperation({ summary: '아바타 채팅 API' })
  @ApiSuccessResponse(AIResponseDTO)
  async chat(@Body() chatDTO: ChatDTO, @GetUUID() uuid: string): Promise<SuccessResponseDTO<AIResponseDTO>> {
    return new SuccessResponseDTO(await this.aiService.chat(chatDTO, uuid));
  }

  @Post('/search')
  @ApiOperation({ summary: '원문 검색 API' })
  @ApiSuccessResponse(SearchResponseDTO)
  async search(@Body() searchDTO: SearchDTO, @GetUUID() uuid: string) {
    return new SuccessResponseDTO(await this.aiService.search(searchDTO, uuid));
  }

  @Post('/combine')
  @ApiOperation({ summary: '자서전 답변 합치기 AI API' })
  @ApiSuccessResponse(AIResponseDTO)
  async combine(@Body() combineDTO: CombineDTO) {
    const CHATGPTTOKEN = 2000;
    const { question1, question2, data1, data2 } = combineDTO;
    const prompt = combinePrompt(question1, question2, data1, data2);

    return new SuccessResponseDTO(await this.aiService.getChatGPTData(prompt, CHATGPTTOKEN));
  }
}

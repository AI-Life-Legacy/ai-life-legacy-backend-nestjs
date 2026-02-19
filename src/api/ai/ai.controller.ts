import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { combinePrompt } from 'src/common/prompt/combine.prompt';
import { AIResponseDTO, ChatDTO, CombineDTO, MakeReQuestionDTO } from './dto/ai.dto';
import { SuccessResponseDTO } from 'src/common/response/response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/deco/api-paginated-response.deco';

@Controller('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('/chat')
  @ApiOperation({ summary: '채팅 AI API' })
  @ApiSuccessResponse(AIResponseDTO)
  async chat(@Body() chatDTO: ChatDTO): Promise<SuccessResponseDTO<AIResponseDTO>> {
    return new SuccessResponseDTO(await this.aiService.chat(chatDTO));
  }

  @Post('/question')
  @ApiOperation({ summary: '2차 질문 생성 AI API' })
  @ApiSuccessResponse(AIResponseDTO)
  async makeReQuestion(@Body() makeReQuestionDTO: MakeReQuestionDTO) {
    return new SuccessResponseDTO(await this.aiService.fuckingTempFunction(makeReQuestionDTO));
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

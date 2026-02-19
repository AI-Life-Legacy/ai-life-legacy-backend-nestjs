import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AIResponseDTO, MakeReQuestionDTO } from './dto/ai.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly apiKey: string;
  private readonly organization: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.organization = this.configService.get<string>('OPENAI_ORGANIZATION');

    if (!this.apiKey) {
      // 키 없으면 OpenAI 클라이언트 안 만들고 그냥 비활성화 상태로 둠
      this.loggerService.warn('OPENAI_API_KEY not set; AiService is disabled in this environment.');
      return;
    }

    this.openai = new OpenAI({
      apiKey: this.apiKey,
      organization: this.organization,
    });
  }

  async getChatGPTData(prompt: string, token: number): Promise<AIResponseDTO> {
    // 키 없을 때, 서버 런타임 에러 없게
    if (!this.openai) {
      this.loggerService.warn('getChatGPTData called but AiService is disabled (no OPENAI_API_KEY).');
      throw new InternalServerErrorException('AI service is not configured.');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // OpenAI의 적절한 모델 사용
        messages: [{ role: 'user', content: prompt }],
        max_tokens: token,
      });

      return { content: response.choices[0]?.message.content };
    } catch (err) {
      this.loggerService.warn(`Chat GPT API Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }

  async fuckingTempFunction(makeReQuestionDTO: MakeReQuestionDTO): Promise<{ content: string }> {
    const { question, data } = makeReQuestionDTO;

    const requestBody = {
      userId: 'temp-user-id', // 그냥 아무 값
      originalQuestion: question, // 기존 질문
      userAnswer: data, // 유저 답변
    };

    const response = await fetch('http://localhost:8000/api/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`AI Server Error: ${response.status}`);
    }

    const result = await response.json();

    const newQuestion = result.question;

    if (!newQuestion) {
      throw new Error('Invalid AI response: question not found');
    }

    return {
      content: newQuestion,
    };
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AIResponseDTO } from './dto/ai.dto';
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

    this.openai = new OpenAI({
      apiKey: this.apiKey,
      organization: this.organization,
    });
  }

  async getChatGPTData(prompt: string, token: number): Promise<AIResponseDTO> {
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
}

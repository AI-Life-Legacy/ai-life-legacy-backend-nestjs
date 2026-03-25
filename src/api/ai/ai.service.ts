import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AIResponseDTO, ChatDTO, MakeReQuestionDTO, MakeCaseDTO, CaseResponseDTO, SyncDTO, SearchDTO, SearchResponseDTO, AutobiographyResponseDTO } from './dto/ai.dto';
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

  async caseClassification(makeCaseDTO: MakeCaseDTO, userId: string): Promise<CaseResponseDTO> {
    const response = await fetch('http://localhost:8000/api/case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        introText: makeCaseDTO.data, // 'data'를 'introText'로 변경
      }),
    });
    if (!response.ok) throw new Error(`AI Server Error: ${response.status}`);
    const result = await response.json();
    return { case: result.case || 'case1' };
  }

  async memorySync(syncDTO: SyncDTO, userId: string): Promise<void> {
    const response = await fetch('http://localhost:8000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        text: syncDTO.content, // 'content'를 'text'로 변경
        metadata: {}, // 필수 metadata 추가
      }),
    });
    if (!response.ok) throw new Error(`AI Server Error: ${response.status}`);
  }

  async generateQuestion(makeReQuestionDTO: MakeReQuestionDTO, userId: string): Promise<AIResponseDTO> {
    const { question, data } = makeReQuestionDTO;

    const requestBody = {
      userId,
      originalQuestion: question,
      userAnswer: data,
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
      message: newQuestion,
    };
  }

  async generateAutobiography(userId: string): Promise<AutobiographyResponseDTO> {
    const response = await fetch('http://localhost:8000/api/autobiography', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName: '사용자' }), // userName 추가
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new InternalServerErrorException(
        `AI Server Error (${response.status}): ${JSON.stringify(errorData.detail || errorData)}`,
      );
    }
    const result = await response.json();
    return {
      markdown: result.mdPath || result.markdownPath || result.markdown || '',
      pdfPath: result.pdfPath || '',
    };
  }

  async chat(chatDTO: ChatDTO, userId: string): Promise<AIResponseDTO> {
    const { message, role } = chatDTO;
    let response;
    try {
      response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: message,
          role: role || '아버지', // default fallback
        }),
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('AI Server connection failed');
    }
    if (!response.ok) {
      throw new Error(`AI Server Error: ${response.status}`);
    }

    const result = await response.json();

    const responseMessage = result.response;
    if (!responseMessage) {
      throw new Error('Invalid AI response: response not found');
    }

    return {
      message: responseMessage,
    };
  }

  async search(searchDTO: SearchDTO, userId: string): Promise<SearchResponseDTO> {
    const response = await fetch('http://localhost:8000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        query: searchDTO.query,
      }),
    });
    if (!response.ok) throw new Error(`AI Server Error: ${response.status}`);
    const result = await response.json();
    return { results: result.results || [] };
  }

  async getChatGPTData(prompt: string, token: number) {
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
}

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserCaseRepository } from '../user-case/user-case.repository';
import { LifeLegacyRepository } from '../life-legacy/life-legacy.repository';
import { UserIntroRepository } from '../user-intro/user-intro.repository';
import { AiService } from '../ai/ai.service';
import { UserWithdrawalRepository } from '../user-withdrawal/user-withdrawal.repository';
import { PatchPostDTO, SaveUserIntroDTO, SaveUserWithdrawalDTO } from './dto/request/user.dto';
import { SaveUserIntroductionRepository } from '../transaction/save-user-introduction.repository';
import { TocWithQuestionsDTO, UserAnswerResponseDTO } from './dto/response/user.dto';
import { DeleteUserRepository } from '../transaction/delete-user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userCaseRepository: UserCaseRepository,
    private lifeLegacyRepository: LifeLegacyRepository,
    private userIntroRepository: UserIntroRepository,
    private aiService: AiService,
    private userWithdrawalRepository: UserWithdrawalRepository,
    private saveUserTransactionRepository: SaveUserIntroductionRepository,
    private deleteUserTransactionRepository: DeleteUserRepository,
  ) {}

  async saveUserIntroduction(uuid: string, saveUserIntroDTO: SaveUserIntroDTO) {
    const { userIntroText } = saveUserIntroDTO;

    const userIntroduction = await this.userIntroRepository.findUserIntroByUuid(uuid);
    if (userIntroduction) throw new ConflictException('Existing User Introduction');

    // AI 서버한테 유저 Introduction을 기준으로 CaseName 받기
    // const prompt = createCasePrompt(userIntroText);
    const userCase = 'case1'; // await this.aiService.getChatGPTData(prompt, 100);

    await this.saveUserTransactionRepository.saveUserIntroduction(userCase, userIntroText, uuid);
  }

  async getUserCase(uuid: string) {
    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new NotFoundException('Not Found User');
    return { caseId: user.userCase.id };
  }

  async getUserToc(uuid: string) {
    const { caseId } = await this.getUserCase(uuid);
    const result = await this.userCaseRepository.findTocAndQuestionsCaseId(caseId);
    const tocQuestions = result.tocMappings.map((mapping) => ({
      tocId: mapping.toc.id,
      tocTitle: mapping.toc.title,
      questionIds: mapping.toc.questions.map((q) => q.id),
    }));
    // 유저가 작성한 모든 답변 가져오기
    const answers = await this.lifeLegacyRepository.findAllUserAnswersByUuid(uuid);

    // QuestionId → answered 여부 매핑
    const answeredSet = new Set(answers.map((a) => a.question.id));

    // toc별 퍼센티지 계산
    return tocQuestions.map((toc) => {
      const total = toc.questionIds.length;
      const answered = toc.questionIds.filter((id) => answeredSet.has(id)).length;
      const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
      return {
        tocId: toc.tocId,
        tocTitle: toc.tocTitle,
        totalQuestions: total,
        answered,
        percent,
      };
    });
  }

  async getUserTocAndQuestions(uuid: string): Promise<TocWithQuestionsDTO[]> {
    const { caseId } = await this.getUserCase(uuid);
    const tocAndQuestions = await this.userCaseRepository.findTocAndQuestionsCaseId(caseId);

    return tocAndQuestions.tocMappings.map((mapping) => ({
      tocId: mapping.toc.id,
      tocTitle: mapping.toc.title,
      orderIndex: mapping.toc.orderIndex,
      questions: mapping.toc.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        orderIndex: q.orderIndex,
      })),
    }));
  }

  async getUserAnswer(questionId: number, tocId: number, uuid: string) {
    // questionId와 uuid를 기준으로 LifeLegacyAnswer 데이터를 findOne하기
    const userAnswer = await this.lifeLegacyRepository.findOneUserAnswerByUuidAndQuestionId(uuid, tocId, questionId);
    // 이 로직은 추후에 바뀔 수 있음 -> 유저의 작성 데이터를 언제 보여주느냐에 따라 바뀔 듯. (만약 다 작성한 다음에 접근할 수 있다면 오류를 뱉는 것이 옳음
    if (!userAnswer) return '';

    return new UserAnswerResponseDTO(userAnswer);
  }

  async updatePost(uuid: string, answerId: number, patchPostDto: PatchPostDTO) {
    const { questionId, tocId, updateAnswer } = patchPostDto;

    const userAnswer = await this.lifeLegacyRepository.findOneUserAnswerByUuidAndQuestionId(uuid, tocId, questionId);
    if (!userAnswer) throw new NotFoundException('Not Found User Answer');

    await this.lifeLegacyRepository.saveUserAnswer(uuid, questionId, updateAnswer);
  }

  async deleteUser(uuid: string, withdrawalDTO: SaveUserWithdrawalDTO) {
    const { withdrawalReason, withdrawalText } = withdrawalDTO;

    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new NotFoundException('Not Found User');

    await this.deleteUserTransactionRepository.deleteUser(uuid, withdrawalReason, withdrawalText);
  }
}

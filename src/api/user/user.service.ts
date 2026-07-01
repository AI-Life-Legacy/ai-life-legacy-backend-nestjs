import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserCaseRepository } from '../user-case/user-case.repository';
import { LifeLegacyRepository } from '../life-legacy/life-legacy.repository';
import { UserIntroRepository } from '../user-intro/user-intro.repository';
import { PatchPostDTO, SaveUserIntroDTO, SaveUserWithdrawalDTO, UpdateNotificationSettingsDTO } from './dto/request/user.dto';
import { SaveUserIntroductionRepository } from '../transaction/save-user-introduction.repository';
import { TocWithQuestionsDTO, UserAnswerResponseDTO } from './dto/response/user.dto';
import { DeleteUserRepository } from '../transaction/delete-user.repository';
import {
  parseAutobiographyPersonalization,
  personalizeChapterTitle,
  personalizeQuestionText,
} from '../../common/personalization/autobiography-toc.personalization';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userCaseRepository: UserCaseRepository,
    private lifeLegacyRepository: LifeLegacyRepository,
    private userIntroRepository: UserIntroRepository,
    private saveUserTransactionRepository: SaveUserIntroductionRepository,
    private deleteUserTransactionRepository: DeleteUserRepository,
  ) {}

  async saveUserIntroduction(uuid: string, saveUserIntroDTO: SaveUserIntroDTO) {
    const { userIntroText } = saveUserIntroDTO;

    const userIntroduction = await this.userIntroRepository.findUserIntroByUuid(uuid);
    if (userIntroduction) throw new ConflictException('Existing User Introduction');

    // DB에 자기소개 텍스트만 저장 (AI 서버 호출하지 않음)
    await this.userIntroRepository.saveUserIntro(uuid, userIntroText);

    return { userIntroText };
  }

  async getUserCase(uuid: string) {
    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new NotFoundException('Not Found User');
    return { caseId: user.userCase?.id || null };
  }

  async getUserToc(uuid: string) {
    const { caseId } = await this.getUserCase(uuid);
    if (!caseId) {
      return {
        totalChapters: 0,
        completedChapters: 0,
        progressPercent: 0,
        chapters: [],
      };
    }

    const result = await this.userCaseRepository.findTocAndQuestionsCaseId(caseId);
    const userIntro = await this.userIntroRepository.findUserIntroByUuid(uuid);
    const personalization = parseAutobiographyPersonalization(userIntro?.introText);
    const tocQuestions = result.tocMappings.map((mapping) => ({
      tocId: mapping.toc.id,
      tocTitle: personalizeChapterTitle(mapping.toc.title, mapping.orderIndex, personalization),
      questionIds: mapping.toc.questions.map((q) => q.id),
    }));

    // 유저가 작성한 모든 답변 가져오기
    const answers = await this.lifeLegacyRepository.findAllUserAnswersByUuid(uuid);

    // QuestionId → answered 여부 매핑
    const answeredSet = new Set(answers.map((a) => a.question.id));

    const chapters = tocQuestions.map((toc) => {
      const total = toc.questionIds.length;
      const answered = toc.questionIds.filter((id) => answeredSet.has(id)).length;
      const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
      return {
        tocId: toc.tocId,
        title: toc.tocTitle,
        done: answered,
        total: total,
        status: answered === 0 ? 'not-started' : answered === total ? 'completed' : 'in-progress',
        percent,
      };
    });

    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((c) => c.status === 'completed').length;
    const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    return {
      totalChapters,
      completedChapters,
      progressPercent,
      chapters,
    };
  }

  async getUserTocAndQuestions(uuid: string): Promise<TocWithQuestionsDTO[]> {
    const { caseId } = await this.getUserCase(uuid);
    if (!caseId) return [];

    const tocAndQuestions = await this.userCaseRepository.findTocAndQuestionsCaseId(caseId);
    const userIntro = await this.userIntroRepository.findUserIntroByUuid(uuid);
    const personalization = parseAutobiographyPersonalization(userIntro?.introText);

    return tocAndQuestions.tocMappings.map((mapping) => ({
      tocId: mapping.toc.id,
      tocTitle: personalizeChapterTitle(mapping.toc.title, mapping.orderIndex, personalization),
      orderIndex: mapping.orderIndex,
      questions: mapping.toc.questions.map((q, index) => ({
        id: q.id,
        questionText: personalizeQuestionText(
          q.questionText,
          personalizeChapterTitle(mapping.toc.title, mapping.orderIndex, personalization),
          index,
          personalization,
        ),
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

    await this.lifeLegacyRepository.saveUserAnswer(uuid, questionId, updateAnswer, userAnswer.id);
  }

  async deleteUser(uuid: string, withdrawalDTO: SaveUserWithdrawalDTO) {
    const { withdrawalReason, withdrawalText } = withdrawalDTO;

    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new NotFoundException('Not Found User');

    await this.deleteUserTransactionRepository.deleteUser(uuid, withdrawalReason, withdrawalText);
  }

  async updateProfileImage(userId: string, file: any): Promise<void> {
    // TODO: S3 업로드 로직 등 구현
  }

  async updateNotificationSettings(userId: string, settings: UpdateNotificationSettingsDTO): Promise<void> {
    // TODO: DB 저장 로직 구현
  }
}

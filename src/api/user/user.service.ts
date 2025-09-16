import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserCaseRepository } from '../user-case/user-case.repository';
import { SaveUserIntroDTO, SetUserCaseDTO } from './dto/user.dto';
import { CustomNotFoundException } from '../../common/exception/exception';
import { PatchPostDTO } from '../life-legacy/dto/save.dto';
import { LifeLegacyRepository } from '../life-legacy/life-legacy.repository';
import { UserIntroRepository } from '../user-intro/user-intro.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userCaseRepository: UserCaseRepository,
    private lifeLegacyRepository: LifeLegacyRepository,
    private userIntroRepository: UserIntroRepository,
  ) {}

  async saveUserIntroduction(uuid: string, saveUserIntroDTO: SaveUserIntroDTO) {
    const { userIntroText } = saveUserIntroDTO;

    const userIntroduction = await this.userIntroRepository.findUserIntroByUuid(uuid);
    if (userIntroduction) throw new ConflictException('Existing User Introduction');

    return await this.userIntroRepository.saveUserIntro(uuid, userIntroText);
  }

  async getUserCase(uuid: string) {
    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new CustomNotFoundException('Not Found User');
    return { caseId: user.userCase.id };
  }

  async setUserCase(uuid: string, setUserCaseDTO: SetUserCaseDTO) {
    const { caseName } = setUserCaseDTO;
    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new CustomNotFoundException('Not Found User');

    // 케이스네임으로 UserCase에 접근해서 해당 caseName 있는지 확인
    const userCase = await this.userCaseRepository.findCaseByCaseName(caseName);
    if (!userCase) throw new CustomNotFoundException('Not Found Case, Check CaseName');

    // 있으면 해당 caseId를 user_case(FK)에 저장
    user.userCase = userCase;

    return await this.userRepository.saveUser(user);
  }

  async getUserTocAndQuestions(uuid: string) {
    const { caseId } = await this.getUserCase(uuid);
    return await this.userCaseRepository.findTocAndQuestionsCaseId(caseId);
  }

  async getUserAnswer(questionId: number, uuid: string) {
    // questionId와 uuid를 기준으로 LifeLegacyAnswer 데이터를 findOne하기
    const userAnswer = await this.lifeLegacyRepository.findUserAnswerByUuidAndQuestionId(uuid, questionId);
    // 이 로직은 추후에 바뀔 수 있음 -> 유저의 작성 데이터를 언제 보여주느냐에 따라 바뀔 듯. (만약 다 작성한 다음에 접근할 수 있다면 오류를 뱉는 것이 옳음
    if (!userAnswer) return '';
    return userAnswer;
  }

  async updatePost(uuid: string, answerId: number, patchPostDto: PatchPostDTO) {
    const { questionId, updateAnswer } = patchPostDto;

    const userAnswer = await this.lifeLegacyRepository.findUserAnswerByUuidAndQuestionId(uuid, questionId);
    if (!userAnswer) throw new CustomNotFoundException('Not Found User Answer');

    await this.lifeLegacyRepository.saveUserAnswer(uuid, questionId, updateAnswer);
  }

  async deleteUser(uuid: string) {
    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new CustomNotFoundException('Not Found User');

    await this.userRepository.deleteUser(user);
  }
}

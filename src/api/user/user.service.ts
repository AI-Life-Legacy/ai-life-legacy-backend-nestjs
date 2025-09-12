import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserCaseRepository } from '../user-case/user-case.repository';
import { SetUserCaseDTO, UserCaseDTO, UserContentAndQuestionsDTO, UserContentDTO, UserPostsDTO } from './dto/user.dto';
import { ContentsRepository } from '../content/contents.repository';
import { PostRepository } from '../post/post.repository';
import { Posts } from '../../db/entity/posts.entity';
import { CustomNotFoundException } from '../../common/exception/exception';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userCaseRepository: UserCaseRepository,
    private contentsRepository: ContentsRepository,
    private postsRepository: PostRepository,
  ) {}

  async getUserCase(uuid: string): Promise<UserCaseDTO> {
    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new CustomNotFoundException('Not Found User');
    return { name: user.userCase.name };
  }

  async setUserCase(uuid: string, setUserCaseDTO: SetUserCaseDTO): Promise<UserCaseDTO> {
    const { caseName } = setUserCaseDTO;
    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new CustomNotFoundException('Not Found User');

    // 케이스네임으로 UserCase에 접근해서 해당 caseName 있는지 확인
    const userCase = await this.userCaseRepository.findCaseByCaseName(caseName);
    if (!userCase) throw new CustomNotFoundException('Not Found Case, Check CaseName');

    // 있으면 해당 caseId를 user_case(FK)에 저장
    user.userCase = userCase;

    await this.userRepository.saveUser(user);
    return { name: userCase.name };
  }

  async getUserContents(uuid: string): Promise<UserContentDTO[]> {
    const { name } = await this.getUserCase(uuid);

    const { contentMappings } = await this.userCaseRepository.findContentsByCaseName(name);

    const userContentList = contentMappings.map((contents) => {
      return {
        id: contents.content.id,
        content: contents.content.text,
      };
    });
    return userContentList;
  }

  async getQuestionsByContentId(contentId: number): Promise<UserContentAndQuestionsDTO> {
    const contents = await this.contentsRepository.findQuestionsByContentsId(contentId);
    if (!contents) throw new CustomNotFoundException('Not Found Content');

    const content = contents.text;
    const questions = contents.questions.map((question) => {
      return {
        id: question.question.id,
        question: question.question.text,
      };
    });

    return {
      id: contentId,
      content: content,
      questions: questions,
    };
  }

  async getAllUserPostsByUUID(uuid: string): Promise<UserPostsDTO[]> {
    const userPosts: Posts[] = await this.postsRepository.findAllUserPostsByUUID(uuid);
    if (userPosts.length == 0) throw new CustomNotFoundException('Not Found Posts');

    const result = userPosts.map((post) => {
      return {
        response: post.response,
        content: post.content.text,
        question: post.question.text,
      };
    });
    return result;
  }

  async deleteUser(uuid: string, deleteType: number) {
    const user = await this.userRepository.findUserByUUID(uuid);
    if (!user) throw new CustomNotFoundException('Not Found User');
    user.deleteType = deleteType;
    await this.userRepository.deleteUser(user);
  }
}

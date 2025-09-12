import { Repository } from 'typeorm';
import { Posts } from '../../db/entity/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomInternalServerException } from '../../common/exception/exception';
import { LoggerService } from '../logger/logger.service';

export class PostRepository {
  constructor(
    @InjectRepository(Posts)
    private postRepository: Repository<Posts>,
    private loggerService: LoggerService,
  ) {}

  async findUserPostsByContentIdAndQuestionId(uuid: string, contentId: number, questionId: number) {
    try {
      return await this.postRepository.findOne({
        where: {
          user: { uuid },
          content: { id: contentId },
          question: { id: questionId },
        },
      });
    } catch (err) {
      this.loggerService.warn(`Post/FindUserPostsByContentIdAndQuestionId Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }
  async findAllUserPostsByUUID(uuid: string) {
    try {
      return await this.postRepository.find({
        where: {
          user: { uuid },
        },
        relations: ['content', 'question'],
      });
    } catch (err) {
      this.loggerService.warn(`Post/FindAllUserPostsByUUID Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }

  async savePost(uuid: string, contentId: number, questionId: number, response: string): Promise<Posts> {
    try {
      return await this.postRepository.save({
        user: { uuid },
        content: { id: contentId },
        question: { id: questionId },
        response: response,
      });
    } catch (err) {
      this.loggerService.warn(`Post/savePost Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }

  async updatePost(uuid: string, contentId: number, questionId: number, response: string) {
    try {
      return await this.postRepository.update(
        {
          user: { uuid },
          content: { id: contentId },
          question: { id: questionId },
        },
        {
          response,
        },
      );
    } catch (err) {
      this.loggerService.warn(`Post/updatePost Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }
}

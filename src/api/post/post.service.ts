import { Injectable } from '@nestjs/common';
import { PatchPostDTO, SavePostDTO } from './dto/post.dto';
import { PostRepository } from './post.repository';
import { UpdateResult } from 'typeorm';

@Injectable()
export class PostService {
  constructor(private postRepository: PostRepository) {}

  async savePost(uuid: string, savePostDto: SavePostDTO) {
    const { contentId, questionId, response } = savePostDto;
    const existResponse = await this.postRepository.findUserPostsByContentIdAndQuestionId(uuid, contentId, questionId);
    if (existResponse) {
      return await this.postRepository.updatePost(uuid, contentId, questionId, response);
    }
    return await this.postRepository.savePost(uuid, contentId, questionId, response);
  }

  async updatePost(uuid: string, patchPostDto: PatchPostDTO): Promise<UpdateResult> {
    const { contentId, questionId, response } = patchPostDto;
    return await this.postRepository.updatePost(uuid, contentId, questionId, response);
  }
}

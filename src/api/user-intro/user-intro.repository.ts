import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserIntro } from '../../db/entity/user-intro.entity';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserIntroRepository {
  constructor(
    @InjectRepository(UserIntro)
    private userIntroRepository: Repository<UserIntro>,
    private loggerService: LoggerService,
  ) {}

  async findUserIntroByUuid(uuid: string) {
    try {
      return await this.userIntroRepository.findOne({
        where: {
          user: { uuid },
        },
      });
    } catch (err) {
      this.loggerService.warn(`User-Intro/FindUserIntroByUuid Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }

  async saveUserIntro(uuid: string, userIntroText: string) {
    try {
      return await this.userIntroRepository.save({
        user: { uuid },
        introText: userIntroText,
      });
    } catch (err) {
      this.loggerService.warn(`User-Intro/SaveUserIntro Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }
}

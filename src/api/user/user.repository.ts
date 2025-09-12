import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entity/user.entity';
import { Repository } from 'typeorm';
import { CustomInternalServerException } from '../../common/exception/exception';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly loggerService: LoggerService,
  ) {}

  async findUserByUUID(uuid: string) {
    try {
      return await this.userRepository.findOne({
        where: { uuid },
        relations: ['userCase'],
      });
    } catch (err) {
      this.loggerService.warn(`User/FindUserByUUID Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }

  async findUserByEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email },
      });
    } catch (err) {
      this.loggerService.warn(`User/FindUserByEmail Error : ${err}`);
      throw new CustomInternalServerException(err);
    }
  }

  async createUser() {
    try {
      const user = await this.userRepository.create({});
      return await this.userRepository.save(user);
    } catch (err) {
      console.error(err);
      throw new CustomInternalServerException();
    }
  }

  async saveUser(user: Users) {
    try {
      return await this.userRepository.save(user);
    } catch (err) {
      console.error(err);
      throw new CustomInternalServerException();
    }
  }

  async updateUserRefreshToken(uuid: string, refreshToken: string) {
    try {
      return await this.userRepository.update(
        {
          uuid,
        },
        {
          refreshToken,
        },
      );
    } catch (err) {
      console.error(err);
      throw new CustomInternalServerException();
    }
  }

  async deleteUser(user: Users) {
    try {
      return await this.userRepository.softRemove(user);
    } catch (err) {
      console.error('Error deleting user:', err);
      throw new CustomInternalServerException();
    }
  }
}

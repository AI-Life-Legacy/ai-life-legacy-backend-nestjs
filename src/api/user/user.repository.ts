import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entity/user.entity';
import { Repository } from 'typeorm';
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
      throw new InternalServerErrorException(err);
    }
  }

  async saveUser(user: User) {
    try {
      return await this.userRepository.save(user);
    } catch (err) {
      this.loggerService.warn(`User/SaveUser Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }

  async deleteUser(user: User) {
    try {
      return await this.userRepository.softRemove(user);
    } catch (err) {
      this.loggerService.warn(`User/DeleteUser Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }
}

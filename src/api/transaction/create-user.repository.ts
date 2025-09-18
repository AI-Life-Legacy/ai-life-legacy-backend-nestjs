import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../db/entity/user.entity';
import { AuthIdentity } from '../../db/entity/auth-identity.entity';
import { Provider } from '../../common/enum/auth-identity.enum';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CreateUserRepository {
  constructor(
    private dataSource: DataSource,
    private readonly loggerService: LoggerService,
  ) {}

  async createUser(providerUuid: string, hashPassword: string, provider: Provider) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(User);
      const authIdentityRepo = queryRunner.manager.getRepository(AuthIdentity);

      const newUser = userRepo.create();
      if (!newUser) throw new Error();
      await userRepo.save(newUser);

      await authIdentityRepo.save({
        user: newUser,
        provider: provider,
        providerUuid: providerUuid,
        passwordHash: hashPassword,
      });

      await queryRunner.commitTransaction();
      return newUser.uuid;
    } catch (err) {
      this.loggerService.warn(`CreateUser/CreateUser Error : ${err}`);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`CreateUser Error : ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}

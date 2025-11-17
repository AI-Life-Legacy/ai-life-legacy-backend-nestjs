import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { UserIntro } from '../../db/entity/user-intro.entity';
import { User } from '../../db/entity/user.entity';
import { UserCase } from '../../db/entity/user-case.entity';

@Injectable()
export class SaveUserIntroductionRepository {
  constructor(
    private dataSource: DataSource,
    private readonly loggerService: LoggerService,
  ) {}

  async saveUserIntroduction(caseName: string, userIntroText: string, uuid: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userIntroRepo = queryRunner.manager.getRepository(UserIntro);
      const userRepo = queryRunner.manager.getRepository(User);
      const userCaseRepo = queryRunner.manager.getRepository(UserCase);

      const user = await userRepo.findOne({
        where: { uuid },
        relations: ['userCase'],
      });
      if (!user) throw new NotFoundException('User Not Found');

      const normalizedCaseName = caseName
        .trim()
        .replace(/case\s*(\d+)/i, (_, num: string) => `Case ${parseInt(num, 10)}`);

      const userCase = await userCaseRepo.findOne({ where: { name: normalizedCaseName } });
      if (!userCase) throw new NotFoundException('UserCase Not Found');

      user.userCase = userCase;

      await userIntroRepo.save({
        user,
        introText: userIntroText,
      });

      await userRepo.save(user);
      await queryRunner.commitTransaction();
    } catch (err) {
      this.loggerService.warn(`SaveUserIntroduction/SaveUserIntroduction Error : ${err}`);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`SaveUserIntroduction Error : ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
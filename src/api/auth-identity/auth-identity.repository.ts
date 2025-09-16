import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthIdentity } from '../../db/entity/auth-identity.entity';
import { Provider } from '../../common/enum/auth-identity.enum';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthIdentityRepository {
  constructor(
    @InjectRepository(AuthIdentity)
    private authIdentityRepository: Repository<AuthIdentity>,
    private readonly loggerService: LoggerService,
  ) {}

  async saveAuthIdentity(uuid: string, provider: Provider, providerUuid: string, passwordHash?: string) {
    try {
      await this.authIdentityRepository.save({
        user: { uuid },
        provider,
        providerUuid,
        passwordHash,
      });
    } catch (err) {
      this.loggerService.warn(`AuthIdentity/SaveAuthIdentity Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }

  async findAuthIdentityByProviderUuid(providerUuid: string) {
    try {
      return await this.authIdentityRepository.findOne({
        where: { providerUuid },
        relations: ['user'],
      });
    } catch (err) {
      this.loggerService.warn(`AuthIdentity/FindAuthIdentityByProviderUuid Error : ${err}`);
      throw new InternalServerErrorException(err);
    }
  }
}
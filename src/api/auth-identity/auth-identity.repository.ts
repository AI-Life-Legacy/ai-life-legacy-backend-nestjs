import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthIdentity } from '../../db/entity/auth-identity.entity';
import { Provider } from '../../common/enum/auth-identity.enum';

@Injectable()
export class AuthIdentityRepository {
  constructor(
    @InjectRepository(AuthIdentity)
    private authIdentityRepository: Repository<AuthIdentity>,
  ) {}

  async saveAuthIdentity(uuid: string, provider: Provider, providerUuid: string, passwordHash?: string) {
    await this.authIdentityRepository.save({
      user: { uuid },
      provider,
      providerUuid,
      passwordHash,
    });
  }

  async findAuthIdentityByProviderUuid(providerUuid: string) {
    return await this.authIdentityRepository.findOne({
      where: { providerUuid },
      relations: ['user'],
    });
  }
}
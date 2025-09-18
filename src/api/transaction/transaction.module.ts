import { Module } from '@nestjs/common';
import { CreateUserRepository } from './create-user.repository';

@Module({
  providers: [CreateUserRepository],
  exports: [CreateUserRepository],
})
export class TransactionModule {}

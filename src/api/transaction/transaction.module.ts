import { Module } from '@nestjs/common';
import { CreateUserRepository } from './create-user.repository';
import { SaveUserIntroductionRepository } from './save-user-introduction.repository';
import { DeleteUserRepository } from './delete-user.repository';

@Module({
  providers: [CreateUserRepository, SaveUserIntroductionRepository, DeleteUserRepository],
  exports: [CreateUserRepository, SaveUserIntroductionRepository, DeleteUserRepository],
})
export class TransactionModule {}

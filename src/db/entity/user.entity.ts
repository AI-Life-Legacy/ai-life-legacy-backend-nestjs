import { Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { AuthIdentity } from './auth-identity.entity';
import { RefreshToken } from './refresh-token.entity';
import { LifeLegacyAnswer } from './life-legacy-answer.entity';
import { UserCase } from './user-case.entity';
import { UserIntro } from './user-intro.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  uuid: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => AuthIdentity, (authIdentity) => authIdentity.user)
  authIdentities: AuthIdentity[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => LifeLegacyAnswer, (answer) => answer.user)
  answers: LifeLegacyAnswer[];

  @ManyToOne(() => UserCase, (userCase) => userCase.users)
  userCase: UserCase;

  @OneToMany(() => UserIntro, (intro) => intro.user)
  intros: UserIntro[];
}

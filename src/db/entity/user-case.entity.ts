import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserCaseContents } from './user-case-contents-mapping.entity';

@Entity('user_cases')
export class UserCase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string; // 유스케이스 이름

  @OneToMany(() => UserCaseContents, (ucc) => ucc.userCase, { cascade: true })
  contentMappings: UserCaseContents[];
}

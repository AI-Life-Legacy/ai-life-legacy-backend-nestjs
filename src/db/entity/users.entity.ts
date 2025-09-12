import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Posts } from './posts.entity';
import { UserCase } from './user-case.entity';

@Entity('users')
export class Users extends BaseEntity {
  @PrimaryColumn()
  uuid: string = uuid();

  @Column()
  refreshToken: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => Posts, (posts) => posts.user)
  posts: Posts;

  @OneToOne(() => UserCase)
  @JoinColumn({ name: 'user_case' })
  userCase: UserCase;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date; // 생성 시간 자동 저장

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date; // 업데이트 시간 자동 갱신

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null; // 소프트 삭제 시간 (Soft Delete)

  @Column({ nullable: true })
  deleteType: number; // 0:앱을 자주 사용 ~...
}

import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { Contents } from './contents.entity';
import { Questions } from './questions.entity';

@Entity('posts')
export class Posts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.posts, { onDelete: 'CASCADE' })
  user: Users;

  @ManyToOne(() => Contents)
  content: Contents;

  @ManyToOne(() => Questions)
  question: Questions;

  @Column({ type: 'text' })
  response: string;
}

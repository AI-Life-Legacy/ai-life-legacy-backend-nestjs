import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';

@Entity('life_legacy_answers')
@Unique(['user', 'question'])
export class LifeLegacyAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'answer_text', type: 'text' })
  answerText: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.answers, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE' })
  question: Question;
}

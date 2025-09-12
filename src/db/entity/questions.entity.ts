import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ContentsQuestion } from './contents-question-mapping.entity';


@Entity('questions')
export class Questions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @OneToMany(() => ContentsQuestion, (cq) => cq.question)
  contentsQuestions: ContentsQuestion[];
}

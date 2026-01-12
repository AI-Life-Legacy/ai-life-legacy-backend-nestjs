import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TableOfContent } from './table-of-content.entity';
import { LifeLegacyAnswer } from './life-legacy-answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'question_text', type: 'varchar', length: 500 })
  questionText: string;

  @ManyToOne(() => TableOfContent, (toc) => toc.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toc_id', referencedColumnName: 'id' })
  toc: TableOfContent;

  @OneToMany(() => LifeLegacyAnswer, (answer) => answer.question)
  answers: LifeLegacyAnswer[];
}

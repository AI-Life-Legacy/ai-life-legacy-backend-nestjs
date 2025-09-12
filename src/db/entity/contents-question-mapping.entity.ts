import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Contents } from "./contents.entity";
import { Questions } from "./questions.entity";

@Entity()
export class ContentsQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Contents, (content) => content.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Contents;

  @ManyToOne(() => Questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Questions;
}

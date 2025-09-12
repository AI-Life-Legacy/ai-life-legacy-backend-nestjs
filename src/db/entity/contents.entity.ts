import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ContentsQuestion } from "./contents-question-mapping.entity";
import { UserCaseContents } from "./user-case-contents-mapping.entity";

@Entity('contents')
export class Contents {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @OneToMany(() => UserCaseContents, (ucc) => ucc.content, { cascade: true })
  userCaseMappings: UserCaseContents[];

  @OneToMany(() => ContentsQuestion, (cq) => cq.content, { cascade: true })
  questions: ContentsQuestion[];
}

import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserCase } from "./user-case.entity";
import { Contents } from "./contents.entity";

@Entity('user_case_contents')
export class UserCaseContents {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserCase, (userCase) => userCase.contentMappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_case_id' })
  userCase: UserCase;

  @ManyToOne(() => Contents, (content) => content.userCaseMappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Contents;
}

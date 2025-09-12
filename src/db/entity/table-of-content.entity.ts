import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Question } from './question.entity';
import { CaseTocMapping } from './case-toc-mapping.entity';

@Entity('table_of_contents')
export class TableOfContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;

  @OneToMany(() => Question, (question) => question.toc)
  questions: Question[];

  @OneToMany(() => CaseTocMapping, (mapping) => mapping.toc)
  caseMappings: CaseTocMapping[];
}

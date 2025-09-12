import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserCase } from './user-case.entity';
import { TableOfContent } from './table-of-content.entity';

@Entity('case_toc_mapping')
export class CaseTocMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;

  @ManyToOne(() => UserCase, (userCase) => userCase.tocMappings, { onDelete: 'CASCADE' })
  userCase: UserCase;

  @ManyToOne(() => TableOfContent, (toc) => toc.caseMappings, { onDelete: 'CASCADE' })
  toc: TableOfContent;
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CaseTocMapping } from './case-toc-mapping.entity';

@Entity('user_cases')
export class UserCase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @OneToMany(() => CaseTocMapping, (mapping) => mapping.userCase)
  tocMappings: CaseTocMapping[];
}

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AutobiographyResult } from './autobiography-result.entity';
import { User } from './user.entity';

@Entity('autobiography_feedbacks')
export class AutobiographyFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: User;

  @Column({ name: 'user_uuid', type: 'uuid' })
  userUuid: string;

  @ManyToOne(() => AutobiographyResult, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'autobiography_result_id' })
  autobiographyResult?: AutobiographyResult;

  @Column({ name: 'autobiography_result_id', type: 'int', nullable: true })
  autobiographyResultId?: number;

  @Column({ type: 'tinyint' })
  rating: number;

  @Column({ name: 'feedback_tags', type: 'simple-array', nullable: true })
  feedbackTags?: string[];

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ name: 'wants_regeneration', type: 'boolean', default: false })
  wantsRegeneration: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

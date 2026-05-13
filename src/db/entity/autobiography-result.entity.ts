import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

export enum AutobiographyStatus {
  NOT_STARTED = 'NOT_STARTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('autobiography_results')
@Unique(['userUuid'])
export class AutobiographyResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: User;

  @Column({ name: 'user_uuid', type: 'uuid' })
  userUuid: string;

  @Column({
    type: 'enum',
    enum: AutobiographyStatus,
    default: AutobiographyStatus.NOT_STARTED,
  })
  status: AutobiographyStatus;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ name: 'page_count', type: 'int', nullable: true })
  pageCount: number;

  @Column({ name: 'content_hash', type: 'varchar', length: 255, nullable: true })
  contentHash: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;
}

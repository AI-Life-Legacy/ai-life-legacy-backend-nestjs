import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { AutobiographyResult } from './autobiography-result.entity';

export enum ViewerCodeStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

@Entity('viewer_codes')
@Unique(['viewerCode'])
export class ViewerCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'viewer_code', type: 'varchar', length: 6 })
  viewerCode: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_user_uuid', referencedColumnName: 'uuid' })
  authorUser: User;

  @Column({ name: 'author_user_uuid', type: 'uuid' })
  authorUserUuid: string;

  @ManyToOne(() => AutobiographyResult, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'autobiography_result_id' })
  autobiographyResult: AutobiographyResult;

  @Column({ name: 'autobiography_result_id', type: 'int' })
  autobiographyResultId: number;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string;

  @Column({
    type: 'enum',
    enum: ViewerCodeStatus,
    default: ViewerCodeStatus.ACTIVE,
  })
  status: ViewerCodeStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

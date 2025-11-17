import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('auth_identities')
@Unique(['provider', 'providerUuid'])
export class AuthIdentity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'provider', type: 'varchar', length: 50 })
  provider: string;

  @Column({ name: 'provider_uuid', type: 'varchar', length: 255 })
  providerUuid: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.authIdentities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' }) 
  user: User;
}

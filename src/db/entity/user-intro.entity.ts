import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_intros')
export class UserIntro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'intro_text', type: 'text' })
  introText: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.intros, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid' })
  user: User;
}

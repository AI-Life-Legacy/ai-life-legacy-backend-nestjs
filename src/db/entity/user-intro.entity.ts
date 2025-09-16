import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_intros')
export class UserIntro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  introText: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.intros, { onDelete: 'CASCADE' })
  user: User;
}

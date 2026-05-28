import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('login_logs')
export class LoginLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  user_id: number;

  @Column()
  @Index()
  email: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({
    type: 'enum',
    enum: ['success', 'failed', 'locked'],
    default: 'failed',
  })
  @Index()
  status: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  @Index()
  created_at: Date;
}

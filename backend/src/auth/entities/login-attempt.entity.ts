import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  email: string;

  @Column({ default: 1 })
  attempts: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_attempt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  locked_until: Date;

  @Column({ nullable: true })
  ip: string;
}

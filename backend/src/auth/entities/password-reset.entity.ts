import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @Column()
  @Index()
  email: string;

  @Column()
  @Index()
  token: string;

  @Column({ type: 'timestamp' })
  @Index()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;
}

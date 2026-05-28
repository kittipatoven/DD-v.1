import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User')
  user: any;

  @Column()
  user_id: number;

  @Column('text')
  message: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true, type: 'json' })
  data: any;

  @CreateDateColumn()
  created_at: Date;
}

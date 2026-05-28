import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Message } from './message.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ name: 'admin_id' })
  admin_id: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'admin_id' })
  admin: any;

  @Column({ name: 'product_id', nullable: true })
  product_id: number;

  @ManyToOne('Product')
  @JoinColumn({ name: 'product_id' })
  product: any;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus = ConversationStatus.ACTIVE;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}

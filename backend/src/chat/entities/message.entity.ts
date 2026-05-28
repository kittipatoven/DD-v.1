import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversation_id: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'sender_id' })
  sender_id: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'sender_id' })
  sender: any;

  @Column('text')
  message: string;

  @Column({ name: 'is_read', default: false })
  is_read: boolean;

  @Column({ name: 'read_at', nullable: true, type: 'timestamp' })
  read_at: Date;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ nullable: true, type: 'text' })
  shipping_address: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  @OneToMany('OrderItem', 'order')
  items: any[];
}

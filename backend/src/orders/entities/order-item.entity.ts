import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Order')
  order: any;

  @Column()
  order_id: number;

  @ManyToOne('Product')
  product: any;

  @Column()
  product_id: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  created_at: Date;
}

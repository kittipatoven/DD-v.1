import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  user_id: number;

  @OneToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];
}

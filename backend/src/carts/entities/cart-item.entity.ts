import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cart_id' })
  cart_id: number;

  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'product_id' })
  product_id: number;

  @ManyToOne('Product')
  @JoinColumn({ name: 'product_id' })
  product: any;

  @Column({ default: 1 })
  quantity: number;
}

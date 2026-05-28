import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_views')
export class ProductView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true, length: 45 })
  ip_address: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

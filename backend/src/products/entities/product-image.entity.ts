import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image_url: string;

  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  product_id: number;
}

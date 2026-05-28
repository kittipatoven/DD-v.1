import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @OneToMany('Product', 'category')
  products: any[];
}

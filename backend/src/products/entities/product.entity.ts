import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ProductType {
  NOTEBOOK = 'notebook',
  PC = 'pc',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne('Category')
  @JoinColumn({ name: 'category_id' })
  category: any;

  @Column({ name: 'category_id' })
  category_id: number;

  @Column()
  stock: number;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.PC,
  })
  type: ProductType = ProductType.PC;

  @Column({ nullable: true })
  brand: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus = ProductStatus.ACTIVE;

  @ManyToOne('User')
  @JoinColumn({ name: 'created_by' })
  createdBy: any;

  @Column({ name: 'created_by', nullable: true })
  created_by: number;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany('Review', 'product')
  reviews: any[];

  @OneToMany('Favorite', 'product')
  favorites: any[];
}

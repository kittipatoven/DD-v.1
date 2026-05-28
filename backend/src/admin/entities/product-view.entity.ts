import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('product_views')
export class ProductView {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Product')
  @JoinColumn({ name: 'product_id' })
  product: any;

  @Column({ name: 'product_id' })
  product_id: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'ip_address', nullable: true, length: 45 })
  ip_address: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;
}

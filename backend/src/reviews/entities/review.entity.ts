import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne('Product')
  @JoinColumn({ name: 'product_id' })
  product: any;

  @Column({ name: 'product_id' })
  product_id: number;

  @Column()
  rating: number;

  @Column('text')
  comment: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;
}

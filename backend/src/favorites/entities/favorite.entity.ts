import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User')
  user: any;

  @Column()
  user_id: number;

  @ManyToOne('Product')
  product: any;

  @Column()
  product_id: number;

  @CreateDateColumn()
  created_at: Date;
}

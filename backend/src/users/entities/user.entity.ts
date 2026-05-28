import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  MUTED = 'muted',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'last_online', nullable: true, type: 'timestamp' })
  last_online: Date;

  @Column({ name: 'is_online', default: false })
  is_online: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'reset_token', nullable: true })
  reset_token: string;

  @Column({ name: 'reset_token_expiry', nullable: true, type: 'timestamp' })
  reset_token_expiry: Date;

  @OneToMany('Product', 'createdBy')
  products: any[];

  @OneToMany('Review', 'user')
  reviews: any[];

  @OneToMany('Favorite', 'user')
  favorites: any[];

  @OneToMany('Notification', 'user')
  notifications: any[];

  @OneToMany('ProductView', 'user')
  productViews: any[];

  @OneToMany('Order', 'user')
  orders: any[];
}

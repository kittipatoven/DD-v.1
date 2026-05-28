import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

export enum StockLogType {
  IN = 'in',
  OUT = 'out',
}

@Entity('stock_logs')
export class StockLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Product')
  product: any;

  @Column()
  product_id: number;

  @Column({
    type: 'enum',
    enum: StockLogType,
  })
  type: StockLogType;

  @Column()
  quantity: number;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @CreateDateColumn()
  created_at: Date;
}

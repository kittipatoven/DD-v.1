import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Repair } from './repair.entity';

export enum RepairImageType {
  BEFORE = 'before',
  AFTER = 'after',
  DURING = 'during',
}

@Entity('repair_images')
export class RepairImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Repair, (repair) => repair.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repair_id' })
  repair: Repair;

  @Column()
  repair_id: number;

  @Column()
  image_url: string;

  @Column({
    type: 'enum',
    enum: RepairImageType,
    default: RepairImageType.AFTER,
  })
  image_type: RepairImageType = RepairImageType.AFTER;

  @Column({ nullable: true })
  caption: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

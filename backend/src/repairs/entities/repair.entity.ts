import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { RepairImage } from './repair-image.entity';

export enum RepairStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
}

@Entity('repairs')
export class Repair {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  device_type: string;

  @Column({
    type: 'enum',
    enum: RepairStatus,
    default: RepairStatus.COMPLETED,
  })
  status: RepairStatus = RepairStatus.COMPLETED;

  @ManyToOne('User')
  @JoinColumn({ name: 'created_by' })
  createdBy: any;

  @Column({ name: 'created_by', nullable: true })
  created_by: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => RepairImage, (image) => image.repair, { cascade: true })
  images: RepairImage[];
}

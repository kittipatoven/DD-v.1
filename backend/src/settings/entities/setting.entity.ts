import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  key_name: string;

  @Column('text')
  value: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

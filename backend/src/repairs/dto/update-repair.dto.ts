import { PartialType } from '@nestjs/mapped-types';
import { CreateRepairDto } from './create-repair.dto';
import { IsEnum, IsArray, IsOptional } from 'class-validator';
import { RepairStatus } from '../entities/repair.entity';
import { RepairImageType } from '../entities/repair-image.entity';

export class UpdateRepairDto extends PartialType(CreateRepairDto) {
  @IsEnum(RepairStatus)
  @IsOptional()
  status?: RepairStatus;

  @IsArray()
  @IsOptional()
  images?: { image_url: string; image_type?: RepairImageType; caption?: string }[];
}

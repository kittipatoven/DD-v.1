import { IsString, IsEnum, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { RepairStatus } from '../entities/repair.entity';
import { RepairImageType } from '../entities/repair-image.entity';

export class CreateRepairDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  device_type?: string;

  @IsEnum(RepairStatus)
  @IsOptional()
  status?: RepairStatus;

  @IsArray()
  @IsOptional()
  images?: { image_url: string; image_type?: RepairImageType; caption?: string }[];
}

import { IsOptional, IsEnum, IsString, IsNumber } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  shipping_address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

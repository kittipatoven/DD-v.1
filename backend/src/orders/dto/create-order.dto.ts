import { IsNumber, IsString, IsOptional, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

export class OrderItemDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  total_price: number;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

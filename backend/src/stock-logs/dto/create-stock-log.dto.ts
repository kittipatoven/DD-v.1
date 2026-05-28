import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { StockLogType } from '../entities/stock-log.entity';

export class CreateStockLogDto {
  @IsNumber()
  product_id: number;

  @IsEnum(StockLogType)
  type: StockLogType;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}

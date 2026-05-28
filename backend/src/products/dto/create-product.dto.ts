import { IsString, IsNumber, IsEnum, Min, IsArray, IsOptional } from 'class-validator';
import { ProductStatus, ProductType } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  category_id: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image_urls?: string[];
}

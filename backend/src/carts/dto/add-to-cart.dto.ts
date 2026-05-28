import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

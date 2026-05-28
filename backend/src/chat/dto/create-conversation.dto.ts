import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateConversationDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  admin_id: number;

  @IsNumber()
  @IsOptional()
  product_id?: number;
}

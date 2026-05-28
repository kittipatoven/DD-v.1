import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}

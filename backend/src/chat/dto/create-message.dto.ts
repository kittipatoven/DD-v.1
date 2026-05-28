import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  @IsNotEmpty()
  conversation_id: number;

  @IsNumber()
  @IsNotEmpty()
  sender_id: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}

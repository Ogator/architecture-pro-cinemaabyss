import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentEventDto {
  @IsInt()
  @Type(() => Number)
  payment_id!: number;

  @IsInt()
  @Type(() => Number)
  user_id!: number;

  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsNotEmpty()
  timestamp!: string;

  @IsOptional()
  @IsString()
  method_type?: string;
}

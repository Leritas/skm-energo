import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CustomerType } from '@skm/specs';

export class CreateOrderDto {
  @IsEnum(CustomerType)
  customerType!: CustomerType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  company?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  inn?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  position?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  customerNote?: string | null;
}

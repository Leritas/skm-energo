import {
  OrderStatus,
  OrderType,
  PaymentStatus,
} from '@skm/specs';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdminOrderLineDto {
  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumberString()
  unitPrice?: string | null;
}

export class UpdateAdminOrderDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ enum: OrderType })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  customerNote?: string | null;

  @ApiPropertyOptional({ type: [UpdateAdminOrderLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAdminOrderLineDto)
  lines?: UpdateAdminOrderLineDto[];
}

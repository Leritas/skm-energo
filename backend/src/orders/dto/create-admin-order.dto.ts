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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminOrderLineDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumberString()
  unitPrice?: string | null;
}

export class CreateAdminOrderDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  userId!: number;

  @ApiProperty({ type: [CreateAdminOrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAdminOrderLineDto)
  lines!: CreateAdminOrderLineDto[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  customerNote?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  customerName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  customerPhone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  customerCompany?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  customerInn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  customerPosition?: string | null;

  @ApiPropertyOptional({ enum: OrderType, nullable: true })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType | null;

  @ApiPropertyOptional({ enum: PaymentStatus, nullable: true })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus | null;
}

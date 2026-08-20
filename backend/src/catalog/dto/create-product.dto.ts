import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PRODUCT_MARKETING_BADGES } from '../../media/media.constants';
import { ProductSpecDto } from './product-spec.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Предохранитель NH00 160A' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: 'NH00-160' })
  @IsString()
  @MinLength(1)
  sku!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiPropertyOptional({ type: ProductSpecDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecDto)
  specs?: ProductSpecDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  manufacturerId!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  categoryId!: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
    enum: PRODUCT_MARKETING_BADGES,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(PRODUCT_MARKETING_BADGES, { each: true })
  badges?: string[];
}

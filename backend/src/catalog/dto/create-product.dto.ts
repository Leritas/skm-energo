import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
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

  @ApiPropertyOptional({
    example: '/files/nh00-160a.pdf',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  pdfHref?: string | null;

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
}

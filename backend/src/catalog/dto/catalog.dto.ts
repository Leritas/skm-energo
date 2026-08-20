import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AttachedFileDto } from '../../media/dto/attached-file.dto';

export class CatalogFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Category slug to filter products or scope the tree',
    example: 'nizkovoltnye-predohraniteli',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Primary manufacturer slug',
    example: 'mersen',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;
}

export class CatalogSearchQueryDto {
  @ApiProperty({
    description: 'Search query matched against title, SKU, and manufacturer name',
    example: 'NH00',
  })
  @IsString()
  q!: string;

  @ApiPropertyOptional({
    description: 'Category slug to scope search',
    example: 'nizkovoltnye-predohraniteli',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer slug to scope search',
    example: 'mersen',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of search results',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CatalogSimilarQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of similar products to return',
    default: 3,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  limit?: number;
}

export class CatalogCategoryQueryDto {
  @ApiPropertyOptional({
    description: 'Hide empty branches for this manufacturer',
    example: 'mersen',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;
}

export class CatalogCategoryResponseDto {
  @ApiProperty({ example: 'predohraniteli' })
  slug!: string;

  @ApiProperty({ example: 'Предохранители, держатели и аксессуары' })
  label!: string;

  @ApiPropertyOptional({
    type: () => CatalogCategoryResponseDto,
    isArray: true,
  })
  children?: CatalogCategoryResponseDto[];
}

export class CatalogManufacturerResponseDto {
  @ApiProperty({ example: 'mersen' })
  slug!: string;

  @ApiProperty({ example: 'MERSEN' })
  label!: string;
}

export class CatalogProductListItemResponseDto {
  @ApiProperty({ example: 'nh00-160a' })
  slug!: string;

  @ApiProperty({ example: 'Предохранитель NH00 160A' })
  title!: string;

  @ApiProperty({ example: 'mersen' })
  manufacturerSlug!: string;

  @ApiProperty({ example: 'nizkovoltnye-predohraniteli' })
  categorySlug!: string;

  @ApiProperty({ example: 'NH00-160' })
  sku!: string;

  @ApiProperty({ example: ['pdf'], isArray: true, type: String })
  badges!: string[];

  @ApiPropertyOptional({ type: AttachedFileDto, nullable: true })
  image!: AttachedFileDto | null;
}

export class CatalogProductSpecDto {
  @ApiProperty({ example: 'Номинальный ток' })
  label!: string;

  @ApiProperty({ example: '160 A' })
  value!: string;
}

export class CatalogProductDetailResponseDto extends CatalogProductListItemResponseDto {
  @ApiProperty()
  description!: string;

  @ApiProperty({ type: CatalogProductSpecDto, isArray: true })
  specs!: CatalogProductSpecDto[];

  @ApiProperty({ type: AttachedFileDto, isArray: true })
  photos!: AttachedFileDto[];

  @ApiProperty({ type: AttachedFileDto, isArray: true })
  documents!: AttachedFileDto[];

  @ApiPropertyOptional({
    example: 'Предохранитель NH00 160A — поставка',
    nullable: true,
  })
  seoTitle!: string | null;

  @ApiPropertyOptional({
    example: 'Низковольтный предохранитель NH00 для промышленных щитов.',
    nullable: true,
  })
  seoDescription!: string | null;
}

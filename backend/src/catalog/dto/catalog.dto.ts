import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ example: '/files/nh00-160a.pdf', nullable: true })
  pdfHref!: string | null;

  @ApiProperty({ example: ['fuse-link-6kv'], isArray: true, type: String })
  similarSlugs!: string[];
}

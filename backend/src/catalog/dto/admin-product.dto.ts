import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSpecDto } from './product-spec.dto';

export class AdminProductAssignmentOptionDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;
}

export class AdminProductAssignmentOptionsDto {
  @ApiProperty({ type: AdminProductAssignmentOptionDto, isArray: true })
  manufacturers!: AdminProductAssignmentOptionDto[];

  @ApiProperty({ type: AdminProductAssignmentOptionDto, isArray: true })
  categories!: AdminProductAssignmentOptionDto[];
}

export class AdminProductDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ type: ProductSpecDto, isArray: true })
  specs!: ProductSpecDto[];

  @ApiPropertyOptional({ type: String, nullable: true })
  pdfHref!: string | null;

  @ApiProperty({ type: String, isArray: true })
  badges!: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  seoTitle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  seoDescription!: string | null;

  @ApiProperty()
  manufacturerId!: number;

  @ApiProperty()
  manufacturerSlug!: string;

  @ApiProperty()
  manufacturerName!: string;

  @ApiProperty()
  categoryId!: number;

  @ApiProperty()
  categorySlug!: string;

  @ApiProperty()
  categoryName!: string;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;
}

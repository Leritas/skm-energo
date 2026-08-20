import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttachedFileDto } from '../../media/dto/attached-file.dto';

export class AdminCategoryDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  seoTitle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  seoDescription!: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  parentId!: number | null;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;

  @ApiProperty()
  productCount!: number;

  @ApiProperty()
  childCount!: number;

  @ApiPropertyOptional({ type: AttachedFileDto, nullable: true })
  coverPhoto!: AttachedFileDto | null;
}

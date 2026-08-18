import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminNewsArticleDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  excerpt!: string;

  @ApiProperty({ type: String, isArray: true })
  body!: string[];

  @ApiProperty({ example: '2026-07-15' })
  publishDate!: string;

  @ApiProperty()
  published!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  seoTitle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  seoDescription!: string | null;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;
}

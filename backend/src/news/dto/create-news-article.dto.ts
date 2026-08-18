import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateNewsArticleDto {
  @ApiProperty({ example: 'hiitio-expand' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @ApiProperty({ example: 'Расширение ассортимента HIITIO' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({
    example:
      'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
  })
  @IsString()
  @MinLength(1)
  excerpt!: string;

  @ApiProperty({
    example: ['Компания СКМ-Энергосервис расширила линейку HIITIO.'],
    isArray: true,
    type: String,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  body!: string[];

  @ApiProperty({ example: '2026-07-15' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  publishDate!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;
}

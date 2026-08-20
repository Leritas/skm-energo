import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttachedFileDto } from '../../media/dto/attached-file.dto';

export class NewsListItemResponseDto {
  @ApiProperty({ example: 'hiitio-expand' })
  slug!: string;

  @ApiProperty({ example: 'Расширение ассортимента HIITIO' })
  title!: string;

  @ApiProperty({
    example:
      'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
  })
  excerpt!: string;

  @ApiProperty({ example: '2026-07-15' })
  publishDate!: string;

  @ApiProperty({ type: AttachedFileDto, nullable: true })
  coverPhoto!: AttachedFileDto | null;
}

export class NewsDetailResponseDto extends NewsListItemResponseDto {
  @ApiProperty({
    example: [
      'Компания СКМ-Энергосервис расширила линейку HIITIO: в каталог добавлены контакторы серии C и реле для промышленных щитов.',
    ],
    isArray: true,
    type: String,
  })
  body!: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  seoTitle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  seoDescription!: string | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { AttachedFileDto } from '../../media/dto/attached-file.dto';

export class AttachedFileItemResponseDto {
  @ApiProperty({ type: AttachedFileDto })
  item!: AttachedFileDto;
}

export class AttachedFileListResponseDto {
  @ApiProperty({ type: AttachedFileDto, isArray: true })
  items!: AttachedFileDto[];
}

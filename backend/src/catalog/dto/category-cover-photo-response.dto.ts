import { ApiProperty } from '@nestjs/swagger';
import { AttachedFileDto } from '../../media/dto/attached-file.dto';

export class CategoryCoverPhotoResponseDto {
  @ApiProperty({ type: AttachedFileDto })
  photo!: AttachedFileDto;
}

import { ApiProperty } from '@nestjs/swagger';
import { AttachedFileDto } from '../../media/dto/attached-file.dto';

export class NewsCoverPhotoResponseDto {
  @ApiProperty({ type: AttachedFileDto })
  photo!: AttachedFileDto;
}

import { ApiProperty } from '@nestjs/swagger';
import type { AttachedFile } from '@skm/specs';

export class AttachedFileDto implements AttachedFile {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'http://localhost:3001/photos/1' })
  url!: string;

  @ApiProperty({ example: 'datasheet.pdf' })
  filename!: string;

  @ApiProperty({ example: 1024 })
  sizeBytes!: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType!: string;
}

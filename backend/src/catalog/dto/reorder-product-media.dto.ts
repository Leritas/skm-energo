import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class ReorderProductPhotosDto {
  @ApiProperty({ type: Number, isArray: true, example: [3, 1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  photoIds!: number[];
}

export class ReorderProductDocumentsDto {
  @ApiProperty({ type: Number, isArray: true, example: [2, 1] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  documentIds!: number[];
}

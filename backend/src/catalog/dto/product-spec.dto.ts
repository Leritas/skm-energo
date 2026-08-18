import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ProductSpecDto {
  @ApiProperty({ example: 'Номинальный ток' })
  @IsString()
  @MinLength(1)
  label!: string;

  @ApiProperty({ example: '160 A' })
  @IsString()
  @MinLength(1)
  value!: string;
}

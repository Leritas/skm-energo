import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListManufacturersAdminQueryDto {
  @ApiPropertyOptional({
    default: false,
    description: 'Include soft-deleted manufacturers in the list',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeArchived = false;
}

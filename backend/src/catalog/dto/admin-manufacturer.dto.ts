import { ApiProperty } from '@nestjs/swagger';

export class AdminManufacturerDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;

  @ApiProperty()
  productCount!: number;
}

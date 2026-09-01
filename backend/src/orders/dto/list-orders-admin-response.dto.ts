import { ApiProperty } from '@nestjs/swagger';
import type { OrderDto } from '@skm/specs';

export class ListOrdersAdminResponseDto {
  @ApiProperty({ isArray: true, type: Object })
  items!: OrderDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

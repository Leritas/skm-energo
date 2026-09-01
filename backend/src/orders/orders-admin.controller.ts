import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permission, type OrderDto } from '@skm/specs';
import { RequireAnyPermissions } from '../common/permissions/require-any-permissions.decorator';
import { RequirePermissions } from '../common/permissions/require-permissions.decorator';
import { CreateAdminOrderDto } from './dto/create-admin-order.dto';
import { ListOrderUserOptionsQueryDto } from './dto/list-order-user-options-query.dto';
import { ListOrdersAdminQueryDto } from './dto/list-orders-admin-query.dto';
import { ListOrdersAdminResponseDto } from './dto/list-orders-admin-response.dto';
import { UpdateAdminOrderDto } from './dto/update-admin-order.dto';
import { OrdersAdminService } from './orders-admin.service';

const ORDERS_READ_PERMISSIONS = [
  Permission.hasAccessToOrders,
  Permission.canManageOrders,
] as const;

@ApiTags('admin-orders')
@ApiBearerAuth()
@Controller('admin/orders')
export class OrdersAdminController {
  constructor(private readonly ordersAdminService: OrdersAdminService) {}

  @Get()
  @RequireAnyPermissions(...ORDERS_READ_PERMISSIONS)
  @ApiOkResponse({ type: ListOrdersAdminResponseDto })
  listOrders(@Query() query: ListOrdersAdminQueryDto) {
    return this.ordersAdminService.list(query);
  }

  @Get('user-options')
  @RequirePermissions(Permission.canManageOrders)
  listUserOptions(@Query() query: ListOrderUserOptionsQueryDto) {
    return this.ordersAdminService.listUserOptions(query);
  }

  @Get('product-options')
  @RequireAnyPermissions(...ORDERS_READ_PERMISSIONS)
  listProductOptions() {
    return this.ordersAdminService.listProductOptions();
  }

  @Get(':id')
  @RequireAnyPermissions(...ORDERS_READ_PERMISSIONS)
  @ApiOkResponse({ description: 'Order detail' })
  getOrder(@Param('id', ParseIntPipe) id: number): Promise<OrderDto> {
    return this.ordersAdminService.getById(id);
  }

  @Post()
  @RequirePermissions(Permission.canManageOrders)
  @ApiCreatedResponse({ description: 'Created order' })
  createOrder(@Body() dto: CreateAdminOrderDto): Promise<OrderDto> {
    return this.ordersAdminService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.canManageOrders)
  @ApiOkResponse({ description: 'Updated order' })
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminOrderDto,
  ): Promise<OrderDto> {
    return this.ordersAdminService.update(id, dto);
  }
}

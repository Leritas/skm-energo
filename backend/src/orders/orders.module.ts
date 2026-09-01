import { Module } from '@nestjs/common';
import { OrdersAdminController } from './orders-admin.controller';
import { OrdersAdminService } from './orders-admin.service';
import { OrdersController } from './orders.controller';
import { OrdersMailService } from './orders-mail.service';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController, OrdersAdminController],
  providers: [OrdersService, OrdersAdminService, OrdersMailService],
})
export class OrdersModule {}

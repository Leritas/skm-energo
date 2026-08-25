import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersMailService } from './orders-mail.service';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersMailService],
})
export class OrdersModule {}

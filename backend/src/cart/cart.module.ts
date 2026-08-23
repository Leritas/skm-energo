import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { CartController } from './cart.controller';
import { CartMergeService } from './cart-merge.service';
import { CartService } from './cart.service';

@Module({
  imports: [MediaModule],
  controllers: [CartController],
  providers: [CartService, CartMergeService],
  exports: [CartMergeService],
})
export class CartModule {}

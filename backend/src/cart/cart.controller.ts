import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { JwtPayloadUser } from '../common/auth/current-user.decorator';
import { Public } from '../common/auth/public.decorator';
import {
  OptionalJwtAuthGuard,
  type RequestWithOptionalUser,
} from '../media/optional-jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CART_SESSION_COOKIE } from './cart.constants';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  getCart(@Req() request: RequestWithOptionalUser) {
    const { userId, guestSessionId } = this.resolveIdentity(request);
    return this.cartService.getCart(userId, guestSessionId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('items')
  addItem(
    @Req() request: RequestWithOptionalUser,
    @Res({ passthrough: true }) response: Response,
    @Body() dto: AddCartItemDto,
  ) {
    const { userId, guestSessionId } = this.resolveIdentity(request);
    return this.cartService.addItem(userId, guestSessionId, dto, response);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Patch('items/:productId')
  updateItem(
    @Req() request: RequestWithOptionalUser,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    const { userId, guestSessionId } = this.resolveIdentity(request);
    return this.cartService.updateItem(
      userId,
      guestSessionId,
      productId,
      dto,
    );
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Delete('items/:productId')
  removeItem(
    @Req() request: RequestWithOptionalUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const { userId, guestSessionId } = this.resolveIdentity(request);
    return this.cartService.removeItem(userId, guestSessionId, productId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Delete()
  clearCart(@Req() request: RequestWithOptionalUser) {
    const { userId, guestSessionId } = this.resolveIdentity(request);
    return this.cartService.clearCart(userId, guestSessionId);
  }

  private resolveIdentity(request: RequestWithOptionalUser): {
    userId: number | undefined;
    guestSessionId: string | undefined;
  } {
    const user = request.user as JwtPayloadUser | undefined;
    if (user?.userId !== undefined) {
      return { userId: user.userId, guestSessionId: undefined };
    }
    const guestSessionId = (request as Request).cookies?.[
      CART_SESSION_COOKIE
    ] as string | undefined;
    return { userId: undefined, guestSessionId };
  }
}

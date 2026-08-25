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
import { CartMergeService } from './cart-merge.service';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CART_SESSION_COOKIE } from './cart.constants';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly cartMergeService: CartMergeService,
  ) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getCart(
    @Req() request: RequestWithOptionalUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const identity = this.resolveIdentity(request);
    await this.mergeGuestCartIfNeeded(identity, response);
    return this.cartService.getCart(identity.userId, identity.guestSessionId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('items')
  async addItem(
    @Req() request: RequestWithOptionalUser,
    @Res({ passthrough: true }) response: Response,
    @Body() dto: AddCartItemDto,
  ) {
    const identity = this.resolveIdentity(request);
    await this.mergeGuestCartIfNeeded(identity, response);
    return this.cartService.addItem(
      identity.userId,
      identity.guestSessionId,
      dto,
      response,
    );
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Patch('items/:productId')
  async updateItem(
    @Req() request: RequestWithOptionalUser,
    @Res({ passthrough: true }) response: Response,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    const identity = this.resolveIdentity(request);
    await this.mergeGuestCartIfNeeded(identity, response);
    return this.cartService.updateItem(
      identity.userId,
      identity.guestSessionId,
      productId,
      dto,
    );
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Delete('items/:productId')
  async removeItem(
    @Req() request: RequestWithOptionalUser,
    @Res({ passthrough: true }) response: Response,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const identity = this.resolveIdentity(request);
    await this.mergeGuestCartIfNeeded(identity, response);
    return this.cartService.removeItem(
      identity.userId,
      identity.guestSessionId,
      productId,
    );
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Delete()
  async clearCart(
    @Req() request: RequestWithOptionalUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const identity = this.resolveIdentity(request);
    await this.mergeGuestCartIfNeeded(identity, response);
    return this.cartService.clearCart(identity.userId, identity.guestSessionId);
  }

  private async mergeGuestCartIfNeeded(
    identity: { userId: number | undefined; guestSessionId: string | undefined },
    response: Response,
  ): Promise<void> {
    if (identity.userId === undefined || !identity.guestSessionId) {
      return;
    }
    await this.cartMergeService.mergeGuestCartIntoUser(
      identity.guestSessionId,
      identity.userId,
      response,
    );
  }

  private resolveIdentity(request: RequestWithOptionalUser): {
    userId: number | undefined;
    guestSessionId: string | undefined;
  } {
    const user = request.user as JwtPayloadUser | undefined;
    const guestSessionId = (request as Request).cookies?.[
      CART_SESSION_COOKIE
    ] as string | undefined;
    if (user?.userId !== undefined) {
      return { userId: user.userId, guestSessionId };
    }
    return { userId: undefined, guestSessionId };
  }
}

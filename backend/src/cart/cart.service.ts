import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CartDto, CartLineDto } from '@skm/specs';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';
import { CART_SESSION_COOKIE, GUEST_CART_TTL_MS } from './cart.constants';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const CART_ITEM_INCLUDE = {
  product: {
    include: {
      manufacturer: true,
      category: true,
      photos: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
    },
  },
} as const;

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: typeof CART_ITEM_INCLUDE;
}>;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly urls: MediaUrlService,
  ) {}

  async getCart(
    userId: number | undefined,
    guestSessionId: string | undefined,
  ): Promise<CartDto> {
    const cart = await this.findCart(userId, guestSessionId);
    if (!cart) {
      return { items: [] };
    }
    return this.toCartDto(cart.id);
  }

  async addItem(
    userId: number | undefined,
    guestSessionId: string | undefined,
    dto: AddCartItemDto,
    res: Response,
  ): Promise<CartDto> {
    await this.assertProductCanBeAdded(dto.productId);

    const { cartId, sessionId } = await this.resolveCartForMutation(
      userId,
      guestSessionId,
      res,
    );

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId, productId: dto.productId },
      },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId,
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });
    }

    if (sessionId) {
      this.setGuestCookie(res, sessionId);
    }

    return this.toCartDto(cartId);
  }

  async updateItem(
    userId: number | undefined,
    guestSessionId: string | undefined,
    productId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartDto> {
    const cart = await this.requireCart(userId, guestSessionId);
    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });

    return this.toCartDto(cart.id);
  }

  async removeItem(
    userId: number | undefined,
    guestSessionId: string | undefined,
    productId: number,
  ): Promise<CartDto> {
    const cart = await this.requireCart(userId, guestSessionId);
    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return this.toCartDto(cart.id);
  }

  async clearCart(
    userId: number | undefined,
    guestSessionId: string | undefined,
  ): Promise<CartDto> {
    const cart = await this.findCart(userId, guestSessionId);
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { items: [] };
  }

  clearGuestCookie(res: Response): void {
    res.clearCookie(CART_SESSION_COOKIE);
  }

  setGuestCookie(res: Response, sessionId: string): void {
    res.cookie(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      maxAge: GUEST_CART_TTL_MS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  private async findCart(
    userId: number | undefined,
    guestSessionId: string | undefined,
  ) {
    if (userId !== undefined) {
      return this.prisma.cart.findUnique({ where: { userId } });
    }
    if (guestSessionId) {
      return this.prisma.cart.findUnique({ where: { guestSessionId } });
    }
    return null;
  }

  private async requireCart(
    userId: number | undefined,
    guestSessionId: string | undefined,
  ) {
    const cart = await this.findCart(userId, guestSessionId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  private async resolveCartForMutation(
    userId: number | undefined,
    guestSessionId: string | undefined,
    res: Response,
  ): Promise<{ cartId: number; sessionId?: string }> {
    if (userId !== undefined) {
      const cart = await this.prisma.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
      return { cartId: cart.id };
    }

    const existing = guestSessionId
      ? await this.prisma.cart.findUnique({ where: { guestSessionId } })
      : null;

    if (existing) {
      return { cartId: existing.id, sessionId: guestSessionId };
    }

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + GUEST_CART_TTL_MS);
    const cart = await this.prisma.cart.create({
      data: { guestSessionId: sessionId, expiresAt },
    });
    this.setGuestCookie(res, sessionId);
    return { cartId: cart.id, sessionId };
  }

  private async assertProductCanBeAdded(productId: number): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        manufacturer: true,
        category: true,
      },
    });
    if (!product || !this.isPublicProduct(product)) {
      throw new ConflictException('Product is not available');
    }
  }

  private isPublicProduct(product: {
    isPublished: boolean;
    deletedAt: Date | null;
    manufacturer: { isPublished: boolean; deletedAt: Date | null };
    category: { isPublished: boolean; deletedAt: Date | null };
  }): boolean {
    return (
      product.isPublished &&
      product.deletedAt === null &&
      product.manufacturer.isPublished &&
      product.manufacturer.deletedAt === null &&
      product.category.isPublished &&
      product.category.deletedAt === null
    );
  }

  private async toCartDto(cartId: number): Promise<CartDto> {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: CART_ITEM_INCLUDE,
      orderBy: { id: 'asc' },
    });

    return {
      items: items.map((item) => this.toLineDto(item)),
    };
  }

  private toLineDto(item: CartItemWithProduct): CartLineDto {
    const photo = item.product.photos[0];
    return {
      productId: item.productId,
      quantity: item.quantity,
      title: item.product.title,
      slug: item.product.slug,
      sku: item.product.sku,
      price: item.product.price?.toString() ?? null,
      photo: photo ? this.urls.toAttachedPhoto(photo) : null,
      isAvailable: this.isPublicProduct(item.product),
    };
  }
}

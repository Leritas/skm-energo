import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';

@Injectable()
export class CartMergeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  async mergeGuestCartIntoUser(
    guestSessionId: string | undefined,
    userId: number,
    res: Response,
  ): Promise<void> {
    if (!guestSessionId) {
      return;
    }

    const guestCart = await this.prisma.cart.findUnique({
      where: { guestSessionId },
      include: { items: true },
    });
    if (!guestCart) {
      this.cartService.clearGuestCookie(res);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const userCart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
        include: { items: true },
      });

      for (const guestItem of guestCart.items) {
        const existing = userCart.items.find(
          (item) => item.productId === guestItem.productId,
        );
        if (existing) {
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + guestItem.quantity },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
            },
          });
        }
      }

      await tx.cart.delete({ where: { id: guestCart.id } });
    });

    this.cartService.clearGuestCookie(res);
  }
}

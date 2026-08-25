import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CustomerType as SpecCustomerType,
  type OrderDto,
} from '@skm/specs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersMailService } from './orders-mail.service';
import {
  deriveOrderTypeFromLines,
  derivePaymentStatus,
  toOrderDto,
  toPrismaCustomerType,
  toPrismaOrderType,
  toPrismaPaymentStatus,
} from './orders.mapper';

const CART_ITEM_INCLUDE = {
  product: {
    include: {
      manufacturer: true,
      category: true,
    },
  },
} as const;

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: typeof CART_ITEM_INCLUDE;
}>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: OrdersMailService,
  ) {}

  async create(userId: number, dto: CreateOrderDto): Promise<OrderDto> {
    this.validateCustomerFields(dto);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: CART_ITEM_INCLUDE,
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const unavailable = cart.items.filter(
      (item) => !this.isPublicProduct(item.product),
    );
    if (unavailable.length > 0) {
      throw new ConflictException('Cart contains unavailable products');
    }

    const lineSnapshots = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.product.price?.toString() ?? null,
    }));

    const orderType = deriveOrderTypeFromLines(lineSnapshots);
    const paymentStatus = derivePaymentStatus(orderType);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          type: toPrismaOrderType(orderType),
          paymentStatus: toPrismaPaymentStatus(paymentStatus),
          customerType: toPrismaCustomerType(dto.customerType),
          customerName: dto.name.trim(),
          customerEmail: user.email,
          customerPhone: dto.phone.trim(),
          customerCompany:
            dto.customerType === SpecCustomerType.legalEntity
              ? dto.company?.trim() ?? null
              : null,
          customerInn:
            dto.customerType === SpecCustomerType.legalEntity
              ? dto.inn?.trim() || null
              : null,
          customerPosition:
            dto.customerType === SpecCustomerType.legalEntity
              ? dto.position?.trim() || null
              : null,
          customerNote: dto.customerNote?.trim() || null,
          lines: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          },
        },
        include: {
          lines: { include: { product: true }, orderBy: { id: 'asc' } },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    const orderDto = toOrderDto(order);
    await this.mail.sendOrderCreatedEmails(orderDto);
    return orderDto;
  }

  async listForUser(userId: number): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        lines: { include: { product: true }, orderBy: { id: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(toOrderDto);
  }

  async getForUser(userId: number, orderId: number): Promise<OrderDto> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        lines: { include: { product: true }, orderBy: { id: 'asc' } },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return toOrderDto(order);
  }

  private validateCustomerFields(dto: CreateOrderDto): void {
    if (!dto.name.trim() || !dto.phone.trim()) {
      throw new BadRequestException('Name and phone are required');
    }
    if (
      dto.customerType === SpecCustomerType.legalEntity &&
      !dto.company?.trim()
    ) {
      throw new BadRequestException('Company is required for legal entity');
    }
  }

  private isPublicProduct(product: CartItemWithProduct['product']): boolean {
    return (
      product.isPublished &&
      product.deletedAt === null &&
      product.manufacturer.isPublished &&
      product.manufacturer.deletedAt === null &&
      product.category.isPublished &&
      product.category.deletedAt === null
    );
  }
}

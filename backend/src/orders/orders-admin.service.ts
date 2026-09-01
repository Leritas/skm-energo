import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CustomerType as SpecCustomerType,
  type AdminOrderProductOptionDto,
  type AdminOrderUserOptionDto,
  type OrderDto,
  OrderStatus as SpecOrderStatus,
} from '@skm/specs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminOrderDto } from './dto/create-admin-order.dto';
import { ListOrderUserOptionsQueryDto } from './dto/list-order-user-options-query.dto';
import { ListOrdersAdminQueryDto } from './dto/list-orders-admin-query.dto';
import { ListOrdersAdminResponseDto } from './dto/list-orders-admin-response.dto';
import { UpdateAdminOrderDto } from './dto/update-admin-order.dto';
import {
  deriveOrderTypeFromLines,
  derivePaymentStatus,
  toOrderDto,
  toPrismaCustomerType,
  toPrismaOrderType,
  toPrismaPaymentStatus,
} from './orders.mapper';

const PRODUCT_INCLUDE = {
  manufacturer: true,
  category: true,
} as const;

const ORDER_INCLUDE = {
  lines: {
    include: { product: true },
    orderBy: { id: 'asc' as const },
  },
} as const;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_INCLUDE;
}>;

@Injectable()
export class OrdersAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListOrdersAdminQueryDto): Promise<ListOrdersAdminResponseDto> {
    const where = query.status ? { status: query.status } : {};
    const skip = (query.page - 1) * query.limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders.map(toOrderDto),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getById(orderId: number): Promise<OrderDto> {
    const order = await this.findOrderOrThrow(orderId);
    return toOrderDto(order);
  }

  async listUserOptions(
    query: ListOrderUserOptionsQueryDto,
  ): Promise<AdminOrderUserOptionDto[]> {
    const search = query.search?.trim();
    const users = await this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
      },
      orderBy: { email: 'asc' },
      take: 20,
    });
    return users;
  }

  async listProductOptions(): Promise<AdminOrderProductOptionDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        manufacturer: { isPublished: true, deletedAt: null },
        category: { isPublished: true, deletedAt: null },
      },
      select: {
        id: true,
        title: true,
        sku: true,
        price: true,
      },
      orderBy: { title: 'asc' },
      take: 200,
    });

    return products.map((product) => ({
      id: product.id,
      title: product.title,
      sku: product.sku,
      price: product.price?.toString() ?? null,
    }));
  }

  async create(dto: CreateAdminOrderDto): Promise<OrderDto> {
    if (dto.lines.length === 0) {
      throw new BadRequestException('At least one order line is required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const products = await this.loadPublishedProducts(
      dto.lines.map((line) => line.productId),
    );

    const lineSnapshots = dto.lines.map((line) => {
      const product = products.get(line.productId);
      if (!product) {
        throw new ConflictException('Order contains unavailable products');
      }
      const unitPrice =
        line.unitPrice !== undefined && line.unitPrice !== null
          ? line.unitPrice
          : product.price?.toString() ?? null;
      return {
        productId: line.productId,
        quantity: line.quantity,
        unitPrice,
        product,
      };
    });

    const customerCompany =
      dto.customerCompany?.trim() || user.company?.trim() || null;
    const customerType =
      customerCompany !== null
        ? SpecCustomerType.legalEntity
        : SpecCustomerType.individual;

    const derivedType = deriveOrderTypeFromLines(
      lineSnapshots.map((line) => ({ unitPrice: line.unitPrice })),
    );
    const orderType = dto.type ?? derivedType;
    const paymentStatus = dto.paymentStatus ?? derivePaymentStatus(orderType);

    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        type: toPrismaOrderType(orderType),
        status: SpecOrderStatus.pending,
        paymentStatus: toPrismaPaymentStatus(paymentStatus),
        customerType: toPrismaCustomerType(customerType),
        customerName: dto.customerName?.trim() || user.name,
        customerEmail: user.email,
        customerPhone: dto.customerPhone?.trim() || user.phone?.trim() || null,
        customerCompany,
        customerInn: dto.customerInn?.trim() || user.inn?.trim() || null,
        customerPosition:
          dto.customerPosition?.trim() || user.position?.trim() || null,
        customerNote: dto.customerNote?.trim() || null,
        lines: {
          create: lineSnapshots.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });

    return toOrderDto(order);
  }

  async update(orderId: number, dto: UpdateAdminOrderDto): Promise<OrderDto> {
    await this.findOrderOrThrow(orderId);

    if (dto.lines !== undefined && dto.lines.length === 0) {
      throw new BadRequestException('At least one order line is required');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      if (dto.lines !== undefined) {
        const products = await this.loadPublishedProducts(
          dto.lines.map((line) => line.productId),
        );
        await tx.orderLine.deleteMany({ where: { orderId } });
        await tx.orderLine.createMany({
          data: dto.lines.map((line) => {
            const product = products.get(line.productId);
            if (!product) {
              throw new ConflictException('Order contains unavailable products');
            }
            const unitPrice =
              line.unitPrice !== undefined && line.unitPrice !== null
                ? line.unitPrice
                : product.price?.toString() ?? null;
            return {
              orderId,
              productId: line.productId,
              quantity: line.quantity,
              unitPrice,
            };
          }),
        });
      }

      const data: Prisma.OrderUpdateInput = {};

      if (dto.status !== undefined) {
        data.status = dto.status;
      }
      if (dto.paymentStatus !== undefined) {
        data.paymentStatus = toPrismaPaymentStatus(dto.paymentStatus);
      }
      if (dto.type !== undefined) {
        data.type = toPrismaOrderType(dto.type);
      }
      if (dto.customerNote !== undefined) {
        data.customerNote = dto.customerNote?.trim() || null;
      }

      return tx.order.update({
        where: { id: orderId },
        data,
        include: ORDER_INCLUDE,
      });
    });

    return toOrderDto(order);
  }

  private async findOrderOrThrow(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  private async loadPublishedProducts(productIds: number[]) {
    const uniqueIds = [...new Set(productIds)];
    const products = await this.prisma.product.findMany({
      where: { id: { in: uniqueIds } },
      include: PRODUCT_INCLUDE,
    });

    const map = new Map<number, ProductWithRelations>();
    for (const product of products) {
      if (this.isPublicProduct(product)) {
        map.set(product.id, product);
      }
    }
    return map;
  }

  private isPublicProduct(product: ProductWithRelations): boolean {
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

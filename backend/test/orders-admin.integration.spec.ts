import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  OrderStatus,
  OrderType,
  PaymentStatus,
  Permission,
} from '@skm/specs';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './create-test-app';

describe('Admin orders (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const runId = `admin-orders-${Date.now()}`;
  let manufacturerId: number;
  let categoryId: number;
  let pricedProductId: number;
  let unpricedProductId: number;
  let customerUserId: number;
  let moderatorToken: string;
  let readOnlyToken: string;
  let existingOrderId: number;

  beforeAll(async () => {
    process.env.MEDIA_PUBLIC_BASE = 'http://localhost:3001';

    app = await createTestApp();
    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    const passwordHash = await bcrypt.hash('AdminOrdersTest1!', 10);

    const moderatorRole = await prisma.role.upsert({
      where: { slug: `${runId}-moderator` },
      update: {
        permissions: [
          Permission.hasAccessToOrders,
          Permission.canManageOrders,
        ],
      },
      create: {
        slug: `${runId}-moderator`,
        name: 'Orders moderator',
        permissions: [
          Permission.hasAccessToOrders,
          Permission.canManageOrders,
        ],
        isSystem: false,
      },
    });

    const readOnlyRole = await prisma.role.upsert({
      where: { slug: `${runId}-reader` },
      update: {
        permissions: [Permission.hasAccessToOrders],
      },
      create: {
        slug: `${runId}-reader`,
        name: 'Orders reader',
        permissions: [Permission.hasAccessToOrders],
        isSystem: false,
      },
    });

    const moderator = await prisma.user.create({
      data: {
        email: `${runId}-moderator@example.com`,
        name: 'Orders Moderator',
        passwordHash,
        roles: { create: { roleId: moderatorRole.id } },
      },
    });
    moderatorToken = jwtService.sign({ sub: moderator.id });

    const reader = await prisma.user.create({
      data: {
        email: `${runId}-reader@example.com`,
        name: 'Orders Reader',
        passwordHash,
        roles: { create: { roleId: readOnlyRole.id } },
      },
    });
    readOnlyToken = jwtService.sign({ sub: reader.id });

    const customer = await prisma.user.create({
      data: {
        email: `${runId}-customer@example.com`,
        name: 'Customer User',
        phone: '+7 900 000-99-01',
        company: 'ООО Клиент',
        passwordHash,
      },
    });
    customerUserId = customer.id;

    const manufacturer = await prisma.manufacturer.create({
      data: {
        slug: `${runId}-manufacturer`,
        name: 'Admin Orders Manufacturer',
        isPublished: true,
      },
    });
    manufacturerId = manufacturer.id;

    const category = await prisma.category.create({
      data: {
        slug: `${runId}-category`,
        name: 'Admin Orders Category',
        isPublished: true,
      },
    });
    categoryId = category.id;

    const priced = await prisma.product.create({
      data: {
        slug: `${runId}-priced`,
        title: 'Priced product',
        sku: `${runId}-priced`,
        description: 'Has price',
        specs: [],
        badges: [],
        similarSlugs: [],
        price: '2500.00',
        manufacturerId,
        categoryId,
        isPublished: true,
      },
    });
    pricedProductId = priced.id;

    const unpriced = await prisma.product.create({
      data: {
        slug: `${runId}-unpriced`,
        title: 'Unpriced product',
        sku: `${runId}-unpriced`,
        description: 'No price',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId,
        categoryId,
        isPublished: true,
      },
    });
    unpricedProductId = unpriced.id;

    const existingOrder = await prisma.order.create({
      data: {
        userId: customerUserId,
        type: 'purchase',
        status: 'pending',
        paymentStatus: 'pending_manual',
        customerType: 'legal_entity',
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerCompany: customer.company,
        lines: {
          create: [
            {
              productId: pricedProductId,
              quantity: 1,
              unitPrice: '2500.00',
            },
          ],
        },
      },
    });
    existingOrderId = existingOrder.id;
  });

  afterAll(async () => {
    await prisma.orderLine.deleteMany({
      where: { product: { slug: { startsWith: runId } } },
    });
    await prisma.order.deleteMany({
      where: { user: { email: { startsWith: runId } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: runId } },
    });
    await prisma.role.deleteMany({
      where: { slug: { startsWith: runId } },
    });
    await prisma.product.deleteMany({
      where: { slug: { startsWith: runId } },
    });
    await prisma.category.deleteMany({
      where: { slug: { startsWith: runId } },
    });
    await prisma.manufacturer.deleteMany({
      where: { slug: { startsWith: runId } },
    });
    await app.close();
  });

  it('rejects unauthenticated admin list', async () => {
    await request(app.getHttpServer()).get('/api/admin/orders').expect(401);
  });

  it('lists orders for reader with hasAccessToOrders', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${readOnlyToken}`)
      .expect(200);

    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.total).toBeGreaterThan(0);
    expect(response.body.items[0].number).toMatch(/^SKM-\d+$/);
  });

  it('returns order detail for reader', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/admin/orders/${existingOrderId}`)
      .set('Authorization', `Bearer ${readOnlyToken}`)
      .expect(200);

    expect(response.body.id).toBe(existingOrderId);
    expect(response.body.customerEmail).toBe(`${runId}-customer@example.com`);
    expect(response.body.lines).toHaveLength(1);
  });

  it('rejects manual create for reader without canManageOrders', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/orders')
      .set('Authorization', `Bearer ${readOnlyToken}`)
      .send({
        userId: customerUserId,
        lines: [{ productId: pricedProductId, quantity: 1 }],
      })
      .expect(403);
  });

  it('creates manual order for existing user with published products', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/admin/orders')
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({
        userId: customerUserId,
        lines: [{ productId: unpricedProductId, quantity: 3 }],
        customerNote: 'Создано из админки',
      })
      .expect(201);

    expect(response.body.number).toMatch(/^SKM-\d+$/);
    expect(response.body.status).toBe(OrderStatus.pending);
    expect(response.body.type).toBe(OrderType.requestProducts);
    expect(response.body.paymentStatus).toBe(PaymentStatus.notRequired);
    expect(response.body.customerEmail).toBe(`${runId}-customer@example.com`);
    expect(response.body.customerNote).toBe('Создано из админки');
    expect(response.body.lines).toHaveLength(1);
    expect(response.body.lines[0].quantity).toBe(3);
  });

  it('patches order status and paymentStatus for manager', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/admin/orders/${existingOrderId}`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({
        status: OrderStatus.processing,
        paymentStatus: PaymentStatus.paidManual,
      })
      .expect(200);

    expect(response.body.id).toBe(existingOrderId);
    expect(response.body.status).toBe(OrderStatus.processing);
    expect(response.body.paymentStatus).toBe(PaymentStatus.paidManual);
  });
});

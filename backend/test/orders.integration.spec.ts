import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  CustomerType,
  OrderType,
  PaymentStatus,
} from '@skm/specs';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './create-test-app';

describe('Orders (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const runId = `orders-${Date.now()}`;
  let manufacturerId: number;
  let categoryId: number;
  let pricedProductId: number;
  let unpricedProductId: number;
  let unpublishedProductId: number;
  let userId: number;
  let userToken: string;
  let otherUserId: number;
  let otherUserToken: string;
  const userPassword = 'OrdersTestUser1!';

  beforeAll(async () => {
    process.env.MEDIA_PUBLIC_BASE = 'http://localhost:3001';

    app = await createTestApp();
    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    const userRole = await prisma.role.upsert({
      where: { slug: 'user' },
      update: {},
      create: {
        slug: 'user',
        name: 'User',
        permissions: [],
        isSystem: true,
      },
    });

    const passwordHash = await bcrypt.hash(userPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: `${runId}@example.com`,
        name: 'Orders Test User',
        phone: '+7 900 000-00-01',
        passwordHash,
        roles: { create: { roleId: userRole.id } },
      },
    });
    userId = user.id;
    userToken = jwtService.sign({ sub: userId });

    const otherUser = await prisma.user.create({
      data: {
        email: `${runId}-other@example.com`,
        name: 'Other User',
        passwordHash,
        roles: { create: { roleId: userRole.id } },
      },
    });
    otherUserId = otherUser.id;
    otherUserToken = jwtService.sign({ sub: otherUserId });

    const manufacturer = await prisma.manufacturer.create({
      data: {
        slug: `${runId}-manufacturer`,
        name: 'Orders Test Manufacturer',
        isPublished: true,
      },
    });
    manufacturerId = manufacturer.id;

    const category = await prisma.category.create({
      data: {
        slug: `${runId}-category`,
        name: 'Orders Test Category',
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
        price: '1500.00',
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

    const unpublished = await prisma.product.create({
      data: {
        slug: `${runId}-unpublished`,
        title: 'Unpublished product',
        sku: `${runId}-unpublished`,
        description: 'Not available',
        specs: [],
        badges: [],
        similarSlugs: [],
        price: '999.00',
        manufacturerId,
        categoryId,
        isPublished: false,
      },
    });
    unpublishedProductId = unpublished.id;
  });

  afterAll(async () => {
    await prisma.orderLine.deleteMany({
      where: { product: { slug: { startsWith: runId } } },
    });
    await prisma.order.deleteMany({
      where: { user: { email: { startsWith: runId } } },
    });
    await prisma.cartItem.deleteMany({
      where: { product: { slug: { startsWith: runId } } },
    });
    await prisma.cart.deleteMany({
      where: { user: { email: { startsWith: runId } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: runId } },
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

  async function seedUserCart(
    uid: number,
    items: Array<{ productId: number; quantity: number }>,
  ) {
    const cart = await prisma.cart.upsert({
      where: { userId: uid },
      create: { userId: uid },
      update: {},
    });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    for (const item of items) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }
  }

  it('rejects unauthenticated order creation', async () => {
    await request(app.getHttpServer()).post('/api/orders').send({}).expect(401);
  });

  it('rejects empty cart', async () => {
    await prisma.cartItem.deleteMany({
      where: { cart: { userId } },
    });

    await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        customerType: CustomerType.individual,
        name: 'Test User',
        phone: '+7 900 000-00-01',
      })
      .expect(400);
  });

  it('rejects cart with unavailable products', async () => {
    await seedUserCart(userId, [
      { productId: unpublishedProductId, quantity: 1 },
    ]);

    await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        customerType: CustomerType.individual,
        name: 'Test User',
        phone: '+7 900 000-00-01',
      })
      .expect(409);
  });

  it('creates purchase order from fully priced cart and clears cart', async () => {
    await seedUserCart(userId, [{ productId: pricedProductId, quantity: 2 }]);

    const response = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        customerType: CustomerType.individual,
        name: 'Иван Тестов',
        phone: '+7 900 111-22-33',
        customerNote: 'Срочно',
      })
      .expect(201);

    expect(response.body.number).toMatch(/^SKM-\d+$/);
    expect(response.body.type).toBe(OrderType.purchase);
    expect(response.body.paymentStatus).toBe(PaymentStatus.pendingManual);
    expect(response.body.customerType).toBe(CustomerType.individual);
    expect(response.body.customerName).toBe('Иван Тестов');
    expect(response.body.customerEmail).toBe(`${runId}@example.com`);
    expect(response.body.customerNote).toBe('Срочно');
    expect(response.body.lines).toHaveLength(1);
    expect(response.body.lines[0].unitPrice).toBe('1500');
    expect(response.body.lines[0].quantity).toBe(2);

    const cart = await request(app.getHttpServer())
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(cart.body.items).toHaveLength(0);
  });

  it('creates request-products order when any line lacks price', async () => {
    await seedUserCart(userId, [
      { productId: pricedProductId, quantity: 1 },
      { productId: unpricedProductId, quantity: 1 },
    ]);

    const response = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        customerType: CustomerType.legalEntity,
        name: 'Контакт',
        phone: '+7 900 222-33-44',
        company: 'ООО Тест',
        inn: '7701234567',
      })
      .expect(201);

    expect(response.body.type).toBe(OrderType.requestProducts);
    expect(response.body.paymentStatus).toBe(PaymentStatus.notRequired);
    expect(response.body.customerType).toBe(CustomerType.legalEntity);
    expect(response.body.customerCompany).toBe('ООО Тест');
    expect(response.body.lines).toHaveLength(2);
    const prices = response.body.lines.map(
      (line: { unitPrice: string | null }) => line.unitPrice,
    );
    expect(prices).toContain('1500');
    expect(prices).toContain(null);
  });

  it('lists and returns own orders only', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThan(0);

    const orderId = list.body[0].id;

    await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(404);

    const detail = await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(detail.body.id).toBe(orderId);
    expect(detail.body.number).toBe(`SKM-${orderId}`);
  });
});

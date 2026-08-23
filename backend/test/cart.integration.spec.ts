import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { CART_SESSION_COOKIE } from '../src/cart/cart.constants';
import { createTestApp } from './create-test-app';

describe('Cart (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const runId = `cart-${Date.now()}`;
  let manufacturerId: number;
  let categoryId: number;
  let publishedProductId: number;
  let unpublishedProductId: number;
  let userId: number;
  let userToken: string;
  const userPassword = 'CartTestUser1!';

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
        name: 'Cart Test User',
        passwordHash,
        roles: { create: { roleId: userRole.id } },
      },
    });
    userId = user.id;
    userToken = jwtService.sign({ sub: userId });

    const manufacturer = await prisma.manufacturer.create({
      data: {
        slug: `${runId}-manufacturer`,
        name: 'Cart Test Manufacturer',
        isPublished: true,
      },
    });
    manufacturerId = manufacturer.id;

    const category = await prisma.category.create({
      data: {
        slug: `${runId}-category`,
        name: 'Cart Test Category',
        isPublished: true,
      },
    });
    categoryId = category.id;

    const published = await prisma.product.create({
      data: {
        slug: `${runId}-published`,
        title: 'Published product',
        sku: `${runId}-published`,
        description: 'Available for cart',
        specs: [],
        badges: [],
        similarSlugs: [],
        price: '1999.99',
        manufacturerId,
        categoryId,
        isPublished: true,
      },
    });
    publishedProductId = published.id;

    const unpublished = await prisma.product.create({
      data: {
        slug: `${runId}-unpublished`,
        title: 'Unpublished product',
        sku: `${runId}-unpublished`,
        description: 'Not available for cart',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId,
        categoryId,
        isPublished: false,
      },
    });
    unpublishedProductId = unpublished.id;
  });

  afterAll(async () => {
    await prisma.cartItem.deleteMany({
      where: {
        product: { slug: { startsWith: runId } },
      },
    });
    await prisma.cart.deleteMany({
      where: {
        OR: [{ userId }, { user: { email: { startsWith: runId } } }],
      },
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

  it('guest can add, update, remove items and receive a session cookie', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent.get('/api/cart').expect(200).expect({ items: [] });

    const addResponse = await agent
      .post('/api/cart/items')
      .send({ productId: publishedProductId, quantity: 2 })
      .expect(201);

    const cookie = addResponse.headers['set-cookie'];
    expect(cookie).toBeDefined();
    expect(String(cookie)).toContain(CART_SESSION_COOKIE);

    await agent
      .get('/api/cart')
      .expect(200)
      .expect((response) => {
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0]).toMatchObject({
          productId: publishedProductId,
          quantity: 2,
          title: 'Published product',
          isAvailable: true,
          price: '1999.99',
        });
      });

    await agent
      .patch(`/api/cart/items/${publishedProductId}`)
      .send({ quantity: 5 })
      .expect(200)
      .expect((response) => {
        expect(response.body.items[0].quantity).toBe(5);
      });

    await agent
      .delete(`/api/cart/items/${publishedProductId}`)
      .expect(200)
      .expect({ items: [] });

    await agent
      .post('/api/cart/items')
      .send({ productId: publishedProductId, quantity: 1 })
      .expect(201);

    await agent.delete('/api/cart').expect(200).expect({ items: [] });
  });

  it('rejects adding unpublished products', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/api/cart/items')
      .send({ productId: unpublishedProductId, quantity: 1 })
      .expect(409);
  });

  it('authenticated user cart persists by userId', async () => {
    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: publishedProductId, quantity: 3 })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].quantity).toBe(3);
      });

    await request(app.getHttpServer())
      .delete('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });

  it('marks unavailable lines on GET when product becomes unpublished', async () => {
    const agent = request.agent(app.getHttpServer());

    const hiddenProduct = await prisma.product.create({
      data: {
        slug: `${runId}-to-hide`,
        title: 'Soon hidden product',
        sku: `${runId}-to-hide`,
        description: 'Will become unavailable',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId,
        categoryId,
        isPublished: true,
      },
    });

    await agent
      .post('/api/cart/items')
      .send({ productId: hiddenProduct.id, quantity: 1 })
      .expect(201);

    await prisma.product.update({
      where: { id: hiddenProduct.id },
      data: { isPublished: false },
    });

    await agent
      .get('/api/cart')
      .expect(200)
      .expect((response) => {
        const line = response.body.items.find(
          (item: { productId: number }) => item.productId === hiddenProduct.id,
        );
        expect(line).toBeDefined();
        expect(line.isAvailable).toBe(false);
      });

    await agent.delete(`/api/cart/items/${hiddenProduct.id}`).expect(200);
    await prisma.product.delete({ where: { id: hiddenProduct.id } });
  });

  it('merges guest cart into user cart on login with summed quantities', async () => {
    await prisma.cartItem.deleteMany({
      where: { cart: { userId } },
    });
    await prisma.cart.deleteMany({ where: { userId } });

    const secondProduct = await prisma.product.create({
      data: {
        slug: `${runId}-merge-second`,
        title: 'Merge second product',
        sku: `${runId}-merge-second`,
        description: 'Second merge product',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId,
        categoryId,
        isPublished: true,
      },
    });

    await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: publishedProductId, quantity: 2 })
      .expect(201);

    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/cart/items')
      .send({ productId: publishedProductId, quantity: 3 })
      .expect(201);
    await agent
      .post('/api/cart/items')
      .send({ productId: secondProduct.id, quantity: 1 })
      .expect(201);

    await agent
      .post('/api/auth/login')
      .send({ email: `${runId}@example.com`, password: userPassword })
      .expect(201);

    const merged = await request(app.getHttpServer())
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(merged.body.items).toHaveLength(2);
    const publishedLine = merged.body.items.find(
      (item: { productId: number }) => item.productId === publishedProductId,
    );
    const secondLine = merged.body.items.find(
      (item: { productId: number }) => item.productId === secondProduct.id,
    );
    expect(publishedLine.quantity).toBe(5);
    expect(secondLine.quantity).toBe(1);

    await agent.get('/api/cart').expect(200).expect({ items: [] });

    await request(app.getHttpServer())
      .delete('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    await prisma.product.delete({ where: { id: secondProduct.id } });
  });
});

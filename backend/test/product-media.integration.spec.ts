import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Permission } from '@skm/specs';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { MediaStorageService } from '../src/media/media-storage.service';
import { createTestApp } from './create-test-app';

describe('Product photos and documents (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: MediaStorageService;
  let uploadDir: string;
  let adminToken: string;

  const runId = `product-media-${Date.now()}`;
  let productId: number;
  let photoId: number;
  let documentId: number;

  beforeAll(async () => {
    uploadDir = mkdtempSync(join(tmpdir(), 'skm-product-media-test-'));
    process.env.MEDIA_PUBLIC_BASE = 'http://localhost:3001';
    process.env.MEDIA_UPLOAD_DIR = uploadDir;

    app = await createTestApp();
    prisma = app.get(PrismaService);
    storage = app.get(MediaStorageService);

    const jwtService = app.get(JwtService);
    const passwordHash = await bcrypt.hash('ProductMediaAdmin1!', 10);
    const adminRole = await prisma.role.upsert({
      where: { slug: `${runId}-admin` },
      update: {
        permissions: [
          Permission.hasAbsoluteControl,
          Permission.canManageProducts,
        ],
      },
      create: {
        slug: `${runId}-admin`,
        name: 'Product media test admin',
        permissions: [
          Permission.hasAbsoluteControl,
          Permission.canManageProducts,
        ],
        isSystem: false,
      },
    });
    const adminUser = await prisma.user.create({
      data: {
        email: `${runId}@example.com`,
        name: 'Product Media Test Admin',
        passwordHash,
        roles: { create: { roleId: adminRole.id } },
      },
    });
    adminToken = jwtService.sign({ sub: adminUser.id });

    const manufacturer = await prisma.manufacturer.create({
      data: {
        slug: `${runId}-manufacturer`,
        name: 'Product Media Manufacturer',
        isPublished: true,
      },
    });

    const category = await prisma.category.create({
      data: {
        slug: `${runId}-category`,
        name: 'Product Media Category',
        isPublished: true,
      },
    });

    const product = await prisma.product.create({
      data: {
        slug: `${runId}-product`,
        title: 'Product media test item',
        sku: `${runId}-sku`,
        description: 'Integration test product',
        specs: [],
        badges: ['new'],
        similarSlugs: [],
        manufacturerId: manufacturer.id,
        categoryId: category.id,
        isPublished: true,
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.photo.deleteMany({
      where: { product: { slug: { startsWith: runId } } },
    });
    await prisma.document.deleteMany({
      where: { product: { slug: { startsWith: runId } } },
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
    await prisma.user.deleteMany({
      where: { email: { startsWith: runId } },
    });
    await prisma.role.deleteMany({
      where: { slug: { startsWith: runId } },
    });

    await app.close();
    rmSync(uploadDir, { recursive: true, force: true });
  });

  function writePhotoFixture(name: string): string {
    const path = storage.photoPath(name);
    writeFileSync(path, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
    return path;
  }

  function writeDocumentFixture(name: string): string {
    const path = storage.documentPath(name);
    writeFileSync(path, Buffer.from('%PDF-1.4 product-media-test'));
    return path;
  }

  it('uploads photos and documents via admin routes', async () => {
    const photoStoredName = `${runId}-first.jpg`;
    writePhotoFixture(photoStoredName);

    const photoResponse = await request(app.getHttpServer())
      .post(`/api/admin/catalog/products/${productId}/photos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', writePhotoFixture(`${runId}-upload.jpg`), {
        filename: 'first.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    expect(photoResponse.body.item).toMatchObject({
      filename: 'first.jpg',
      mimeType: 'image/jpeg',
      url: expect.stringMatching(/\/photos\/\d+$/),
    });
    photoId = photoResponse.body.item.id;

    const documentResponse = await request(app.getHttpServer())
      .post(`/api/admin/catalog/products/${productId}/documents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', writeDocumentFixture(`${runId}-upload.pdf`), {
        filename: 'datasheet.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(documentResponse.body.item).toMatchObject({
      filename: 'datasheet.pdf',
      mimeType: 'application/pdf',
      url: expect.stringMatching(/\/documents\/\d+$/),
    });
    documentId = documentResponse.body.item.id;
  });

  it('returns admin product with ordered photos and documents', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/admin/catalog/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.photos).toHaveLength(1);
    expect(response.body.documents).toHaveLength(1);
    expect(response.body.photos[0].id).toBe(photoId);
    expect(response.body.documents[0].id).toBe(documentId);
    expect(response.body).not.toHaveProperty('pdfHref');
  });

  it('reorders photos and documents with strict id validation', async () => {
    const secondPhoto = await request(app.getHttpServer())
      .post(`/api/admin/catalog/products/${productId}/photos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', writePhotoFixture(`${runId}-second.jpg`), {
        filename: 'second.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    const secondPhotoId = secondPhoto.body.item.id;

    await request(app.getHttpServer())
      .put(`/api/admin/catalog/products/${productId}/photos/order`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ photoIds: [secondPhotoId] })
      .expect(400);

    const reorderPhotos = await request(app.getHttpServer())
      .put(`/api/admin/catalog/products/${productId}/photos/order`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ photoIds: [secondPhotoId, photoId] })
      .expect(200);

    expect(reorderPhotos.body.items.map((item: { id: number }) => item.id)).toEqual([
      secondPhotoId,
      photoId,
    ]);

    const reorderDocuments = await request(app.getHttpServer())
      .put(`/api/admin/catalog/products/${productId}/documents/order`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ documentIds: [documentId] })
      .expect(200);

    expect(reorderDocuments.body.items).toHaveLength(1);
  });

  it('serializes public list and detail with image, gallery, and derived pdf badge', async () => {
    const listResponse = await request(app.getHttpServer())
      .get('/api/catalog/products')
      .expect(200);

    const listItem = listResponse.body.find(
      (item: { slug: string }) => item.slug === `${runId}-product`,
    );
    expect(listItem).toMatchObject({
      image: expect.objectContaining({ id: expect.any(Number) }),
      badges: expect.arrayContaining(['pdf', 'new']),
    });
    expect(listItem).not.toHaveProperty('pdfHref');

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/catalog/products/${runId}-product`)
      .expect(200);

    expect(detailResponse.body.photos).toHaveLength(2);
    expect(detailResponse.body.documents).toHaveLength(1);
    expect(detailResponse.body.image).toEqual(detailResponse.body.photos[0]);
    expect(detailResponse.body.badges).toEqual(expect.arrayContaining(['pdf', 'new']));
    expect(detailResponse.body).not.toHaveProperty('pdfHref');
  });

  it('rejects derived pdf badge on product update', async () => {
    await request(app.getHttpServer())
      .patch(`/api/admin/catalog/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ badges: ['pdf', 'new'] })
      .expect(400);
  });

  it('updates marketing badges without accepting pdf', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/admin/catalog/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ badges: ['onRequest'] })
      .expect(200);

    expect(response.body.badges).toEqual(['onRequest']);
  });

  it('deletes photos and documents', async () => {
    const photos = await prisma.photo.findMany({ where: { productId } });
    for (const photo of photos) {
      await request(app.getHttpServer())
        .delete(`/api/admin/catalog/products/${productId}/photos/${photo.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    }

    await request(app.getHttpServer())
      .delete(`/api/admin/catalog/products/${productId}/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/catalog/products/${runId}-product`)
      .expect(200);

    expect(detailResponse.body.photos).toEqual([]);
    expect(detailResponse.body.documents).toEqual([]);
    expect(detailResponse.body.image).toBeNull();
    expect(detailResponse.body.badges).toEqual(['onRequest']);
  });
});

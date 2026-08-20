import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { access } from 'node:fs/promises';
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

describe('Category cover photo (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: MediaStorageService;
  let uploadDir: string;
  let adminToken: string;

  const runId = `category-media-${Date.now()}`;
  let publishedCategoryId: number;
  let unpublishedCategoryId: number;
  let archivedCategoryId: number;
  let firstPhotoId: number;
  let firstStoredName: string;

  beforeAll(async () => {
    uploadDir = mkdtempSync(join(tmpdir(), 'skm-category-media-test-'));
    process.env.MEDIA_PUBLIC_BASE = 'http://localhost:3001';
    process.env.MEDIA_UPLOAD_DIR = uploadDir;

    app = await createTestApp();
    prisma = app.get(PrismaService);
    storage = app.get(MediaStorageService);

    const jwtService = app.get(JwtService);
    const passwordHash = await bcrypt.hash('CategoryMediaAdmin1!', 10);
    const adminRole = await prisma.role.upsert({
      where: { slug: `${runId}-admin` },
      update: {
        permissions: [
          Permission.hasAbsoluteControl,
          Permission.canManageCategories,
        ],
      },
      create: {
        slug: `${runId}-admin`,
        name: 'Category media test admin',
        permissions: [
          Permission.hasAbsoluteControl,
          Permission.canManageCategories,
        ],
        isSystem: false,
      },
    });
    const adminUser = await prisma.user.create({
      data: {
        email: `${runId}@example.com`,
        name: 'Category Media Test Admin',
        passwordHash,
        roles: { create: { roleId: adminRole.id } },
      },
    });
    adminToken = jwtService.sign({ sub: adminUser.id });

    const publishedCategory = await prisma.category.create({
      data: {
        slug: `${runId}-published`,
        name: 'Published category',
        isPublished: true,
      },
    });
    publishedCategoryId = publishedCategory.id;

    const unpublishedCategory = await prisma.category.create({
      data: {
        slug: `${runId}-unpublished`,
        name: 'Unpublished category',
        isPublished: false,
      },
    });
    unpublishedCategoryId = unpublishedCategory.id;

    const archivedCategory = await prisma.category.create({
      data: {
        slug: `${runId}-archived`,
        name: 'Archived category',
        isPublished: false,
        deletedAt: new Date(),
      },
    });
    archivedCategoryId = archivedCategory.id;
  });

  afterAll(async () => {
    await prisma.photo.deleteMany({
      where: {
        category: {
          slug: { startsWith: runId },
        },
      },
    });
    await prisma.product.deleteMany({
      where: { slug: { startsWith: runId } },
    });
    await prisma.manufacturer.deleteMany({
      where: { slug: { startsWith: runId } },
    });
    await prisma.category.deleteMany({
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

  it('uploads a cover photo via admin route', async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/api/admin/catalog/categories/${publishedCategoryId}/cover-photo`,
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', writePhotoFixture(`${runId}-first.jpg`), {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    expect(response.body.photo).toMatchObject({
      filename: 'cover.jpg',
      mimeType: 'image/jpeg',
      url: expect.stringMatching(/\/photos\/\d+$/),
    });
    firstPhotoId = response.body.photo.id;

    const photo = await prisma.photo.findUnique({ where: { id: firstPhotoId } });
    firstStoredName = photo!.storedName;
  });

  it('returns admin list with coverPhoto', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/catalog/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const category = response.body.find(
      (item: { id: number }) => item.id === publishedCategoryId,
    );
    expect(category.coverPhoto).toMatchObject({ id: firstPhotoId });
  });

  it('replaces cover photo and deletes the previous file from disk', async () => {
    const replaceResponse = await request(app.getHttpServer())
      .post(
        `/api/admin/catalog/categories/${publishedCategoryId}/cover-photo`,
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', writePhotoFixture(`${runId}-second.jpg`), {
        filename: 'cover-replacement.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    const secondPhotoId = replaceResponse.body.photo.id;
    expect(secondPhotoId).not.toBe(firstPhotoId);

    await expect(
      prisma.photo.findUnique({ where: { id: firstPhotoId } }),
    ).resolves.toBeNull();
    await expect(access(storage.photoPath(firstStoredName))).rejects.toThrow();

    firstPhotoId = secondPhotoId;
    const photo = await prisma.photo.findUnique({ where: { id: firstPhotoId } });
    firstStoredName = photo!.storedName;
  });

  it('serializes public category tree with coverPhoto on every node', async () => {
    const manufacturer = await prisma.manufacturer.create({
      data: {
        slug: `${runId}-manufacturer`,
        name: 'Category media manufacturer',
        isPublished: true,
      },
    });

    const childCategory = await prisma.category.create({
      data: {
        slug: `${runId}-child`,
        name: 'Child category',
        parentId: publishedCategoryId,
        isPublished: true,
      },
    });

    await prisma.product.create({
      data: {
        slug: `${runId}-product`,
        title: 'Category media product',
        sku: `${runId}-sku`,
        description: 'Product for category tree visibility',
        specs: [],
        categoryId: childCategory.id,
        manufacturerId: manufacturer.id,
        isPublished: true,
      },
    });

    const childUpload = await request(app.getHttpServer())
      .post(`/api/admin/catalog/categories/${childCategory.id}/cover-photo`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', writePhotoFixture(`${runId}-child.jpg`), {
        filename: 'child-cover.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    const treeResponse = await request(app.getHttpServer())
      .get('/api/catalog/categories')
      .expect(200);

    const parent = treeResponse.body.find(
      (item: { slug: string }) => item.slug === `${runId}-published`,
    );
    expect(parent?.coverPhoto).toMatchObject({ id: firstPhotoId });

    const child = parent?.children?.find(
      (item: { slug: string }) => item.slug === `${runId}-child`,
    );
    expect(child?.coverPhoto).toMatchObject({ id: childUpload.body.photo.id });
  });

  it('returns 404 for guests when cover owner is unpublished or archived', async () => {
    async function uploadCover(categoryId: number): Promise<number> {
      const response = await request(app.getHttpServer())
        .post(`/api/admin/catalog/categories/${categoryId}/cover-photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', writePhotoFixture(`${runId}-${categoryId}.jpg`), {
          filename: 'hidden-cover.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);
      return response.body.photo.id;
    }

    const unpublishedPhotoId = await uploadCover(unpublishedCategoryId);
    const archivedPhotoId = await uploadCover(archivedCategoryId);

    await request(app.getHttpServer())
      .get(`/photos/${unpublishedPhotoId}`)
      .expect(404);

    await request(app.getHttpServer())
      .get(`/photos/${archivedPhotoId}`)
      .expect(404);
  });

  it('deletes cover photo via admin route', async () => {
    await request(app.getHttpServer())
      .delete(
        `/api/admin/catalog/categories/${publishedCategoryId}/cover-photo`,
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await expect(
      prisma.photo.findUnique({ where: { id: firstPhotoId } }),
    ).resolves.toBeNull();
    await expect(access(storage.photoPath(firstStoredName))).rejects.toThrow();

    const adminResponse = await request(app.getHttpServer())
      .get('/api/admin/catalog/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const category = adminResponse.body.find(
      (item: { id: number }) => item.id === publishedCategoryId,
    );
    expect(category.coverPhoto).toBeNull();
  });
});

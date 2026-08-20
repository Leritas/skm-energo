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

describe('News cover photo (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: MediaStorageService;
  let uploadDir: string;
  let adminToken: string;

  const runId = `news-media-${Date.now()}`;
  let publishedArticleId: number;
  let unpublishedArticleId: number;
  let archivedArticleId: number;
  let firstPhotoId: number;
  let firstStoredName: string;

  beforeAll(async () => {
    uploadDir = mkdtempSync(join(tmpdir(), 'skm-news-media-test-'));
    process.env.MEDIA_PUBLIC_BASE = 'http://localhost:3001';
    process.env.MEDIA_UPLOAD_DIR = uploadDir;

    app = await createTestApp();
    prisma = app.get(PrismaService);
    storage = app.get(MediaStorageService);

    const jwtService = app.get(JwtService);
    const passwordHash = await bcrypt.hash('NewsMediaAdmin1!', 10);
    const adminRole = await prisma.role.upsert({
      where: { slug: `${runId}-admin` },
      update: {
        permissions: [Permission.hasAbsoluteControl, Permission.canManageNews],
      },
      create: {
        slug: `${runId}-admin`,
        name: 'News media test admin',
        permissions: [Permission.hasAbsoluteControl, Permission.canManageNews],
        isSystem: false,
      },
    });
    const adminUser = await prisma.user.create({
      data: {
        email: `${runId}@example.com`,
        name: 'News Media Test Admin',
        passwordHash,
        roles: { create: { roleId: adminRole.id } },
      },
    });
    adminToken = jwtService.sign({ sub: adminUser.id });

    const publishedArticle = await prisma.newsArticle.create({
      data: {
        slug: `${runId}-published`,
        title: 'Published news article',
        excerpt: 'Published excerpt',
        body: ['Published body paragraph.'],
        publishDate: new Date('2026-07-15'),
        published: true,
      },
    });
    publishedArticleId = publishedArticle.id;

    const unpublishedArticle = await prisma.newsArticle.create({
      data: {
        slug: `${runId}-unpublished`,
        title: 'Unpublished news article',
        excerpt: 'Unpublished excerpt',
        body: ['Unpublished body paragraph.'],
        publishDate: new Date('2026-07-10'),
        published: false,
      },
    });
    unpublishedArticleId = unpublishedArticle.id;

    const archivedArticle = await prisma.newsArticle.create({
      data: {
        slug: `${runId}-archived`,
        title: 'Archived news article',
        excerpt: 'Archived excerpt',
        body: ['Archived body paragraph.'],
        publishDate: new Date('2026-07-05'),
        published: false,
        deletedAt: new Date(),
      },
    });
    archivedArticleId = archivedArticle.id;
  });

  afterAll(async () => {
    await prisma.photo.deleteMany({
      where: {
        newsArticle: {
          slug: { startsWith: runId },
        },
      },
    });
    await prisma.newsArticle.deleteMany({
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
      .post(`/api/admin/news/${publishedArticleId}/cover-photo`)
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
      .get('/api/admin/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const article = response.body.find(
      (item: { id: number }) => item.id === publishedArticleId,
    );
    expect(article.coverPhoto).toMatchObject({ id: firstPhotoId });
  });

  it('replaces cover photo and deletes the previous file from disk', async () => {
    const replaceResponse = await request(app.getHttpServer())
      .post(`/api/admin/news/${publishedArticleId}/cover-photo`)
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

  it('serializes public list and detail with coverPhoto', async () => {
    const listResponse = await request(app.getHttpServer())
      .get('/api/news')
      .expect(200);

    const listItem = listResponse.body.find(
      (item: { slug: string }) => item.slug === `${runId}-published`,
    );
    expect(listItem.coverPhoto).toMatchObject({ id: firstPhotoId });

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/news/${runId}-published`)
      .expect(200);

    expect(detailResponse.body.coverPhoto).toMatchObject({ id: firstPhotoId });
  });

  it('returns 404 for guests when cover owner is unpublished or archived', async () => {
    async function uploadCover(articleId: number): Promise<number> {
      const response = await request(app.getHttpServer())
        .post(`/api/admin/news/${articleId}/cover-photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', writePhotoFixture(`${runId}-${articleId}.jpg`), {
          filename: 'hidden-cover.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);
      return response.body.photo.id;
    }

    const unpublishedPhotoId = await uploadCover(unpublishedArticleId);
    const archivedPhotoId = await uploadCover(archivedArticleId);

    await request(app.getHttpServer())
      .get(`/photos/${unpublishedPhotoId}`)
      .expect(404);

    await request(app.getHttpServer())
      .get(`/photos/${archivedPhotoId}`)
      .expect(404);
  });

  it('deletes cover photo via admin route', async () => {
    await request(app.getHttpServer())
      .delete(`/api/admin/news/${publishedArticleId}/cover-photo`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await expect(
      prisma.photo.findUnique({ where: { id: firstPhotoId } }),
    ).resolves.toBeNull();
    await expect(access(storage.photoPath(firstStoredName))).rejects.toThrow();

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/news/${runId}-published`)
      .expect(200);

    expect(detailResponse.body.coverPhoto).toBeNull();
  });
});

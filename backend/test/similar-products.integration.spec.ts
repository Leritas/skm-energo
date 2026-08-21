import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { MediaStorageService } from '../src/media/media-storage.service';
import { createTestApp } from './create-test-app';

describe('Similar products (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: MediaStorageService;
  let uploadDir: string;

  const runId = `similar-${Date.now()}`;
  let mersenId: number;
  let casramId: number;
  let categoryId: number;
  let sourceSlug: string;
  let alternateSlug: string;
  let sameManufacturerSlug: string;
  let otherCategorySlug: string;

  beforeAll(async () => {
    uploadDir = mkdtempSync(join(tmpdir(), 'skm-similar-test-'));
    process.env.MEDIA_PUBLIC_BASE = 'http://localhost:3001';
    process.env.MEDIA_UPLOAD_DIR = uploadDir;

    app = await createTestApp();
    prisma = app.get(PrismaService);
    storage = app.get(MediaStorageService);

    const mersen = await prisma.manufacturer.create({
      data: {
        slug: `${runId}-mersen`,
        name: 'Similar Test Mersen',
        isPublished: true,
      },
    });
    mersenId = mersen.id;

    const casram = await prisma.manufacturer.create({
      data: {
        slug: `${runId}-casram`,
        name: 'Similar Test Casram',
        isPublished: true,
      },
    });
    casramId = casram.id;

    const category = await prisma.category.create({
      data: {
        slug: `${runId}-category`,
        name: 'Similar Test Category',
        isPublished: true,
      },
    });
    categoryId = category.id;

    const otherCategory = await prisma.category.create({
      data: {
        slug: `${runId}-other-category`,
        name: 'Similar Test Other Category',
        isPublished: true,
      },
    });

    sourceSlug = `${runId}-source`;
    alternateSlug = `${runId}-alternate`;
    sameManufacturerSlug = `${runId}-same-manufacturer`;
    otherCategorySlug = `${runId}-other-category-product`;

    await prisma.product.createMany({
      data: [
        {
          slug: sourceSlug,
          title: 'Source product',
          sku: `${runId}-source`,
          description: 'Primary product for similar tests',
          specs: [],
          badges: [],
          similarSlugs: [otherCategorySlug],
          manufacturerId: mersenId,
          categoryId,
          isPublished: true,
        },
        {
          slug: alternateSlug,
          title: 'Alternate manufacturer product',
          sku: `${runId}-alternate`,
          description: 'Expected similar match',
          specs: [],
          badges: [],
          similarSlugs: [],
          manufacturerId: casramId,
          categoryId,
          isPublished: true,
        },
        {
          slug: sameManufacturerSlug,
          title: 'Same manufacturer product',
          sku: `${runId}-same-manufacturer`,
          description: 'Must not appear in similar list',
          specs: [],
          badges: [],
          similarSlugs: [],
          manufacturerId: mersenId,
          categoryId,
          isPublished: true,
        },
        {
          slug: otherCategorySlug,
          title: 'Other category product',
          sku: `${runId}-other-category`,
          description: 'Different category, must not appear despite similarSlugs',
          specs: [],
          badges: [],
          similarSlugs: [sourceSlug],
          manufacturerId: casramId,
          categoryId: otherCategory.id,
          isPublished: true,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.photo.deleteMany({
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

    await app.close();
    rmSync(uploadDir, { recursive: true, force: true });
  });

  function writePhotoFixture(name: string): void {
    writeFileSync(
      storage.photoPath(name),
      Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    );
  }

  it('matches same-category cross-manufacturer products from the admin graph', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/catalog/products/${sourceSlug}/similar`)
      .expect(200);

    const slugs = response.body.map((item: { slug: string }) => item.slug);

    expect(response.body).toEqual([
      expect.objectContaining({
        slug: alternateSlug,
        manufacturerSlug: `${runId}-casram`,
        categorySlug: `${runId}-category`,
        sku: `${runId}-alternate`,
        image: null,
      }),
    ]);
    expect(slugs).not.toContain(otherCategorySlug);
    expect(slugs).not.toContain(sameManufacturerSlug);
  });

  it('returns an empty list when no cross-manufacturer matches exist', async () => {
    const soloCategory = await prisma.category.create({
      data: {
        slug: `${runId}-solo-category`,
        name: 'Solo category',
        isPublished: true,
      },
    });
    const soloSlug = `${runId}-solo`;

    await prisma.product.create({
      data: {
        slug: soloSlug,
        title: 'Solo manufacturer product',
        sku: `${runId}-solo`,
        description: 'Only product in category',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId: mersenId,
        categoryId: soloCategory.id,
        isPublished: true,
      },
    });

    await request(app.getHttpServer())
      .get(`/api/catalog/products/${soloSlug}/similar`)
      .expect(200)
      .expect([]);
  });

  it('returns 404 for an unknown product slug', async () => {
    await request(app.getHttpServer())
      .get(`/api/catalog/products/${runId}-missing/similar`)
      .expect(404);
  });

  it('respects the limit query parameter', async () => {
    const extraSlug = `${runId}-extra-alternate`;
    await prisma.product.create({
      data: {
        slug: extraSlug,
        title: 'Extra alternate manufacturer product',
        sku: `${runId}-extra-alternate`,
        description: 'Second cross-manufacturer match',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId: casramId,
        categoryId,
        isPublished: true,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/api/catalog/products/${sourceSlug}/similar?limit=1`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].slug).toBe(alternateSlug);
  });

  it('returns attached photo metadata on similar cards', async () => {
    const photoCategory = await prisma.category.create({
      data: {
        slug: `${runId}-photo-category`,
        name: 'Photo test category',
        isPublished: true,
      },
    });
    const withPhotoSlug = `${runId}-with-photo`;
    await prisma.product.create({
      data: {
        slug: withPhotoSlug,
        title: 'Source product with photo sibling',
        sku: `${runId}-with-photo-source`,
        description: 'Source for photo test',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId: mersenId,
        categoryId: photoCategory.id,
        isPublished: true,
      },
    });

    const photoSlug = `${runId}-photo-alternate`;
    const alternateWithPhoto = await prisma.product.create({
      data: {
        slug: photoSlug,
        title: 'Alternate with photo',
        sku: `${runId}-photo-alternate`,
        description: 'Similar product with attached photo',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId: casramId,
        categoryId: photoCategory.id,
        isPublished: true,
      },
    });

    const storedName = `${runId}-similar.jpg`;
    writePhotoFixture(storedName);

    await prisma.photo.create({
      data: {
        productId: alternateWithPhoto.id,
        storedName,
        filename: 'similar.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 4,
        sortOrder: 0,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/api/catalog/products/${withPhotoSlug}/similar`)
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        slug: photoSlug,
        image: expect.objectContaining({
          filename: 'similar.jpg',
          url: expect.stringMatching(/\/photos\/\d+$/),
        }),
      }),
    ]);
  });
});

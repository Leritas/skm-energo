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
import { MediaUploadService } from '../src/media/media-upload.service';
import { createTestApp } from './create-test-app';

function createMulterFile(params: {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: params.originalname,
    encoding: '7bit',
    mimetype: params.mimetype,
    size: params.size,
    destination: join(params.path, '..'),
    filename: params.filename,
    path: params.path,
    buffer: Buffer.alloc(0),
    stream: null as never,
  };
}

describe('Media byte routes (integration)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let upload: MediaUploadService;
  let storage: MediaStorageService;
  let uploadDir: string;
  let adminToken: string;

  const runId = `media-${Date.now()}`;
  let manufacturerId: number;
  let categoryId: number;
  let publicProductId: number;
  let archivedProductId: number;
  let publicPhotoId: number;
  let archivedPhotoId: number;
  let publicDocumentId: number;
  let archivedDocumentId: number;

  beforeAll(async () => {
    uploadDir = mkdtempSync(join(tmpdir(), 'skm-media-test-'));
    process.env.MEDIA_PUBLIC_BASE = 'http://localhost:3001';
    process.env.MEDIA_UPLOAD_DIR = uploadDir;

    app = await createTestApp();
    prisma = app.get(PrismaService);
    upload = app.get(MediaUploadService);
    storage = app.get(MediaStorageService);

    const jwtService = app.get(JwtService);
    const passwordHash = await bcrypt.hash('MediaTestAdmin1!', 10);
    const adminRole = await prisma.role.upsert({
      where: { slug: `${runId}-admin` },
      update: {
        permissions: [Permission.hasAbsoluteControl],
      },
      create: {
        slug: `${runId}-admin`,
        name: 'Media test admin',
        permissions: [Permission.hasAbsoluteControl],
        isSystem: false,
      },
    });
    const adminUser = await prisma.user.create({
      data: {
        email: `${runId}@example.com`,
        name: 'Media Test Admin',
        passwordHash,
        roles: { create: { roleId: adminRole.id } },
      },
    });
    adminToken = jwtService.sign({ sub: adminUser.id });

    const manufacturer = await prisma.manufacturer.create({
      data: {
        slug: `${runId}-manufacturer`,
        name: 'Media Test Manufacturer',
        isPublished: true,
      },
    });
    manufacturerId = manufacturer.id;

    const category = await prisma.category.create({
      data: {
        slug: `${runId}-category`,
        name: 'Media Test Category',
        isPublished: true,
      },
    });
    categoryId = category.id;

    const publicProduct = await prisma.product.create({
      data: {
        slug: `${runId}-public-product`,
        title: 'Public product',
        sku: `${runId}-public`,
        description: 'Published product for media tests',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId,
        categoryId,
        isPublished: true,
      },
    });
    publicProductId = publicProduct.id;

    const archivedProduct = await prisma.product.create({
      data: {
        slug: `${runId}-archived-product`,
        title: 'Archived product',
        sku: `${runId}-archived`,
        description: 'Archived product for media tests',
        specs: [],
        badges: [],
        similarSlugs: [],
        manufacturerId,
        categoryId,
        isPublished: false,
        deletedAt: new Date(),
      },
    });
    archivedProductId = archivedProduct.id;

    publicPhotoId = await seedPhoto(publicProductId, 'public.jpg');
    archivedPhotoId = await seedPhoto(archivedProductId, 'archived.jpg');
    publicDocumentId = await seedDocument(publicProductId, 'public.pdf');
    archivedDocumentId = await seedDocument(archivedProductId, 'archived.pdf');
  });

  afterAll(async () => {
    await prisma.photo.deleteMany({
      where: {
        product: {
          slug: { startsWith: runId },
        },
      },
    });
    await prisma.document.deleteMany({
      where: {
        product: {
          slug: { startsWith: runId },
        },
      },
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

  async function seedPhoto(productId: number, filename: string): Promise<number> {
    const storedName = `${runId}-${filename.replace('.jpg', '')}.jpg`;
    const path = storage.photoPath(storedName);
    writeFileSync(path, Buffer.from('fake-image-bytes'));

    const attached = await upload.attachPhoto(
      createMulterFile({
        originalname: filename,
        filename: storedName,
        mimetype: 'image/jpeg',
        size: 16,
        path,
      }),
      { productId },
    );
    return attached.id;
  }

  async function seedDocument(
    productId: number,
    filename: string,
  ): Promise<number> {
    const storedName = `${runId}-${filename.replace('.pdf', '')}.pdf`;
    const path = storage.documentPath(storedName);
    writeFileSync(path, Buffer.from('fake-pdf-bytes'));

    const attached = await upload.attachDocument(
      createMulterFile({
        originalname: filename,
        filename: storedName,
        mimetype: 'application/pdf',
        size: 14,
        path,
      }),
      { productId },
    );
    return attached.id;
  }

  it('returns photo bytes for guests when the owner is public', async () => {
    await request(app.getHttpServer())
      .get(`/photos/${publicPhotoId}`)
      .expect(200)
      .expect('Content-Type', /image\/jpeg/)
      .expect('Content-Disposition', /inline/);
  });

  it('returns 404 for guests when the photo owner is archived', async () => {
    await request(app.getHttpServer())
      .get(`/photos/${archivedPhotoId}`)
      .expect(404);
  });

  it('allows admins to preview photos on archived owners', async () => {
    await request(app.getHttpServer())
      .get(`/photos/${archivedPhotoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect('Content-Type', /image\/jpeg/);
  });

  it('returns document bytes with attachment disposition for guests', async () => {
    await request(app.getHttpServer())
      .get(`/documents/${publicDocumentId}`)
      .expect(200)
      .expect('Content-Type', /application\/pdf/)
      .expect(
        'Content-Disposition',
        /attachment; filename\*=UTF-8''public\.pdf/,
      );
  });

  it('returns 404 for guests when the document owner is unpublished', async () => {
    await request(app.getHttpServer())
      .get(`/documents/${archivedDocumentId}`)
      .expect(404);
  });

  it('does not leave orphan disk files when attach fails after upload', async () => {
    const storedName = `${runId}-orphan-test.jpg`;
    const path = storage.photoPath(storedName);
    writeFileSync(path, Buffer.from('orphan-test'));

    await expect(
      upload.attachPhoto(
        createMulterFile({
          originalname: 'orphan.jpg',
          filename: storedName,
          mimetype: 'image/jpeg',
          size: 11,
          path,
        }),
        { productId: 9_999_999 },
      ),
    ).rejects.toThrow();

    await expect(import('node:fs/promises').then(({ access }) => access(path)))
      .rejects.toThrow();
  });
});

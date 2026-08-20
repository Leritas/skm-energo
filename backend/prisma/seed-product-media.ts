import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

const SEED_MEDIA_PRODUCT_SLUG = 'nh00-160a';

function uploadRoot(): string {
  return process.env.MEDIA_UPLOAD_DIR ?? join(process.cwd(), 'uploads');
}

function ensureUploadDirs(): { photoDir: string; documentDir: string } {
  const root = uploadRoot();
  const photoDir = join(root, 'photos');
  const documentDir = join(root, 'documents');
  mkdirSync(photoDir, { recursive: true });
  mkdirSync(documentDir, { recursive: true });
  return { photoDir, documentDir };
}

function writeMinimalPdf(path: string): void {
  writeFileSync(
    path,
    Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\ntrailer\n<< /Root 1 0 R >>\nstartxref\n0\n%%EOF\n',
    ),
  );
}

export async function seedProductMedia(prisma: PrismaClient): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { slug: SEED_MEDIA_PRODUCT_SLUG },
    include: {
      photos: true,
      documents: true,
    },
  });

  if (!product) {
    throw new Error(`Missing seed product ${SEED_MEDIA_PRODUCT_SLUG}`);
  }

  if (product.photos.length > 0 || product.documents.length > 0) {
    return;
  }

  const { photoDir, documentDir } = ensureUploadDirs();
  const photoStoredName = `${randomUUID()}.jpg`;
  const documentStoredName = `${randomUUID()}.pdf`;
  const photoPath = join(photoDir, photoStoredName);
  const documentPath = join(documentDir, documentStoredName);

  const logoPath = join(process.cwd(), '..', 'frontend', 'public', 'logo.jpg');
  try {
    copyFileSync(logoPath, photoPath);
  } catch {
    writeFileSync(photoPath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  }

  writeMinimalPdf(documentPath);

  const photoStat = await import('node:fs/promises').then(({ stat }) =>
    stat(photoPath),
  );
  const documentStat = await import('node:fs/promises').then(({ stat }) =>
    stat(documentPath),
  );

  await prisma.photo.create({
    data: {
      filename: 'nh00-160a.jpg',
      storedName: photoStoredName,
      mimeType: 'image/jpeg',
      sizeBytes: photoStat.size,
      sortOrder: 0,
      productId: product.id,
    },
  });

  await prisma.document.create({
    data: {
      filename: 'NH00-160A datasheet.pdf',
      storedName: documentStoredName,
      mimeType: 'application/pdf',
      sizeBytes: documentStat.size,
      sortOrder: 0,
      productId: product.id,
    },
  });

  console.log(`Seeded media for product ${SEED_MEDIA_PRODUCT_SLUG}`);
}

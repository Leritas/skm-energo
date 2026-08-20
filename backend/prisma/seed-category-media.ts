import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

const SEED_CATEGORY_COVER_SLUG = 'predohraniteli';

function uploadRoot(): string {
  return process.env.MEDIA_UPLOAD_DIR ?? join(process.cwd(), 'uploads');
}

function ensurePhotoDir(): string {
  const photoDir = join(uploadRoot(), 'photos');
  mkdirSync(photoDir, { recursive: true });
  return photoDir;
}

export async function seedCategoryMedia(prisma: PrismaClient): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { slug: SEED_CATEGORY_COVER_SLUG },
    include: { photos: true },
  });

  if (!category) {
    throw new Error(`Missing seed category ${SEED_CATEGORY_COVER_SLUG}`);
  }

  if (category.photos.length > 0) {
    return;
  }

  const photoDir = ensurePhotoDir();
  const photoStoredName = `${randomUUID()}.jpg`;
  const photoPath = join(photoDir, photoStoredName);

  const logoPath = join(process.cwd(), '..', 'frontend', 'public', 'logo.jpg');
  try {
    copyFileSync(logoPath, photoPath);
  } catch {
    writeFileSync(photoPath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  }

  const photoStat = await stat(photoPath);

  await prisma.photo.create({
    data: {
      filename: 'predohraniteli.jpg',
      storedName: photoStoredName,
      mimeType: 'image/jpeg',
      sizeBytes: photoStat.size,
      sortOrder: 0,
      categoryId: category.id,
    },
  });

  console.log(`Seeded cover photo for category ${SEED_CATEGORY_COVER_SLUG}`);
}

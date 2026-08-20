import { Injectable, NotFoundException } from '@nestjs/common';
import type { AttachedFile } from '@skm/specs';
import { MediaUploadService } from '../media/media-upload.service';
import { PrismaService } from '../prisma/prisma.service';

type UploadedFile = Express.Multer.File;

@Injectable()
export class CategoryMediaAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: MediaUploadService,
  ) {}

  async replaceCoverPhoto(
    categoryId: number,
    file: UploadedFile,
  ): Promise<{ photo: AttachedFile }> {
    await this.assertCategoryExists(categoryId);
    await this.detachAllCoverPhotos(categoryId);

    const photo = await this.upload.attachPhoto(
      file,
      { categoryId },
      0,
    );
    return { photo };
  }

  async deleteCoverPhoto(categoryId: number): Promise<void> {
    await this.assertCategoryExists(categoryId);
    await this.detachAllCoverPhotos(categoryId);
  }

  private async detachAllCoverPhotos(categoryId: number): Promise<void> {
    const existing = await this.prisma.photo.findMany({
      where: { categoryId },
    });
    for (const photo of existing) {
      await this.upload.detachPhoto(photo.id);
    }
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }
}

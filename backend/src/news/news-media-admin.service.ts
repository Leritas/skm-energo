import { Injectable, NotFoundException } from '@nestjs/common';
import type { AttachedFile } from '@skm/specs';
import { MediaUploadService } from '../media/media-upload.service';
import { PrismaService } from '../prisma/prisma.service';

type UploadedFile = Express.Multer.File;

@Injectable()
export class NewsMediaAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: MediaUploadService,
  ) {}

  async replaceCoverPhoto(
    articleId: number,
    file: UploadedFile,
  ): Promise<{ photo: AttachedFile }> {
    await this.assertArticleExists(articleId);
    await this.detachAllCoverPhotos(articleId);

    const photo = await this.upload.attachPhoto(
      file,
      { newsArticleId: articleId },
      0,
    );
    return { photo };
  }

  async deleteCoverPhoto(articleId: number): Promise<void> {
    await this.assertArticleExists(articleId);
    await this.detachAllCoverPhotos(articleId);
  }

  private async detachAllCoverPhotos(articleId: number): Promise<void> {
    const existing = await this.prisma.photo.findMany({
      where: { newsArticleId: articleId },
    });
    for (const photo of existing) {
      await this.upload.detachPhoto(photo.id);
    }
  }

  private async assertArticleExists(articleId: number): Promise<void> {
    const article = await this.prisma.newsArticle.findUnique({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException('News article not found');
    }
  }
}

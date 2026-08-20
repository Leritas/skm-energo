import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AttachedFile } from '@skm/specs';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertSingleOwner,
  isDocumentMimeType,
  isPhotoMimeType,
  type MediaOwnerRef,
} from './media.constants';
import { MediaStorageService } from './media-storage.service';
import { MediaUrlService } from './media-url.service';

type UploadedFile = Express.Multer.File;

@Injectable()
export class MediaUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorageService,
    private readonly urls: MediaUrlService,
  ) {}

  async attachPhoto(
    file: UploadedFile,
    owner: MediaOwnerRef,
    sortOrder?: number,
  ): Promise<AttachedFile> {
    assertSingleOwner(owner);
    this.assertPhotoFile(file);

    try {
      await this.assertOwnerExists(owner);

      const nextSortOrder =
        sortOrder ?? (await this.nextPhotoSortOrder(owner));

      const photo = await this.prisma.photo.create({
        data: {
          filename: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          sortOrder: nextSortOrder,
          ...owner,
        },
      });
      return this.urls.toAttachedPhoto(photo);
    } catch (error) {
      await this.storage.deletePhoto(file.filename);
      throw error;
    }
  }

  async attachDocument(
    file: UploadedFile,
    owner: MediaOwnerRef,
    sortOrder?: number,
  ): Promise<AttachedFile> {
    assertSingleOwner(owner);
    this.assertDocumentFile(file);

    try {
      await this.assertOwnerExists(owner);

      const nextSortOrder =
        sortOrder ?? (await this.nextDocumentSortOrder(owner));

      const document = await this.prisma.document.create({
        data: {
          filename: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          sortOrder: nextSortOrder,
          ...owner,
        },
      });
      return this.urls.toAttachedDocument(document);
    } catch (error) {
      await this.storage.deleteDocument(file.filename);
      throw error;
    }
  }

  async detachPhoto(photoId: number): Promise<void> {
    const photo = await this.prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.photo.delete({ where: { id: photoId } });
    await this.storage.deletePhoto(photo.storedName);
  }

  async detachDocument(documentId: number): Promise<void> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.document.delete({ where: { id: documentId } });
    await this.storage.deleteDocument(document.storedName);
  }

  private assertPhotoFile(file: UploadedFile): void {
    if (!isPhotoMimeType(file.mimetype)) {
      throw new BadRequestException(`Unsupported photo mime type: ${file.mimetype}`);
    }
  }

  private assertDocumentFile(file: UploadedFile): void {
    if (!isDocumentMimeType(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported document mime type: ${file.mimetype}`,
      );
    }
  }

  private async assertOwnerExists(owner: MediaOwnerRef): Promise<void> {
    if ('productId' in owner) {
      const product = await this.prisma.product.findUnique({
        where: { id: owner.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return;
    }

    if ('newsArticleId' in owner) {
      const article = await this.prisma.newsArticle.findUnique({
        where: { id: owner.newsArticleId },
      });
      if (!article) {
        throw new NotFoundException('News article not found');
      }
      return;
    }

    const category = await this.prisma.category.findUnique({
      where: { id: owner.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private async nextPhotoSortOrder(owner: MediaOwnerRef): Promise<number> {
    const aggregate = await this.prisma.photo.aggregate({
      where: owner,
      _max: { sortOrder: true },
    });
    return (aggregate._max.sortOrder ?? -1) + 1;
  }

  private async nextDocumentSortOrder(owner: MediaOwnerRef): Promise<number> {
    const aggregate = await this.prisma.document.aggregate({
      where: owner,
      _max: { sortOrder: true },
    });
    return (aggregate._max.sortOrder ?? -1) + 1;
  }
}

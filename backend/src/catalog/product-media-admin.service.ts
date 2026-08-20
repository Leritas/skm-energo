import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AttachedFile } from '@skm/specs';
import {
  MAX_DOCUMENTS_PER_PRODUCT,
  MAX_PHOTOS_PER_PRODUCT,
} from '../media/media.constants';
import { MediaUploadService } from '../media/media-upload.service';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';

type UploadedFile = Express.Multer.File;

@Injectable()
export class ProductMediaAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: MediaUploadService,
    private readonly urls: MediaUrlService,
  ) {}

  async uploadPhoto(
    productId: number,
    file: UploadedFile,
  ): Promise<{ item: AttachedFile }> {
    await this.assertProductExists(productId);
    await this.assertPhotoCapacity(productId);

    const item = await this.upload.attachPhoto(file, { productId });
    return { item };
  }

  async deletePhoto(productId: number, photoId: number): Promise<void> {
    await this.assertPhotoOwnedByProduct(productId, photoId);
    await this.upload.detachPhoto(photoId);
  }

  async reorderPhotos(
    productId: number,
    photoIds: number[],
  ): Promise<{ items: AttachedFile[] }> {
    await this.assertProductExists(productId);
    const photos = await this.loadProductPhotos(productId);
    this.assertExactIdPermutation(
      photoIds,
      photos.map((photo) => photo.id),
      'photoIds',
    );

    await this.prisma.$transaction(
      photoIds.map((photoId, index) =>
        this.prisma.photo.update({
          where: { id: photoId },
          data: { sortOrder: index },
        }),
      ),
    );

    const reordered = await this.loadProductPhotos(productId);
    return { items: reordered.map((photo) => this.urls.toAttachedPhoto(photo)) };
  }

  async uploadDocument(
    productId: number,
    file: UploadedFile,
  ): Promise<{ item: AttachedFile }> {
    await this.assertProductExists(productId);
    await this.assertDocumentCapacity(productId);

    const item = await this.upload.attachDocument(file, { productId });
    return { item };
  }

  async deleteDocument(productId: number, documentId: number): Promise<void> {
    await this.assertDocumentOwnedByProduct(productId, documentId);
    await this.upload.detachDocument(documentId);
  }

  async reorderDocuments(
    productId: number,
    documentIds: number[],
  ): Promise<{ items: AttachedFile[] }> {
    await this.assertProductExists(productId);
    const documents = await this.loadProductDocuments(productId);
    this.assertExactIdPermutation(
      documentIds,
      documents.map((document) => document.id),
      'documentIds',
    );

    await this.prisma.$transaction(
      documentIds.map((documentId, index) =>
        this.prisma.document.update({
          where: { id: documentId },
          data: { sortOrder: index },
        }),
      ),
    );

    const reordered = await this.loadProductDocuments(productId);
    return {
      items: reordered.map((document) => this.urls.toAttachedDocument(document)),
    };
  }

  private async assertProductExists(productId: number): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private async assertPhotoCapacity(productId: number): Promise<void> {
    const count = await this.prisma.photo.count({ where: { productId } });
    if (count >= MAX_PHOTOS_PER_PRODUCT) {
      throw new BadRequestException(
        `A product may have at most ${MAX_PHOTOS_PER_PRODUCT} photos`,
      );
    }
  }

  private async assertDocumentCapacity(productId: number): Promise<void> {
    const count = await this.prisma.document.count({ where: { productId } });
    if (count >= MAX_DOCUMENTS_PER_PRODUCT) {
      throw new BadRequestException(
        `A product may have at most ${MAX_DOCUMENTS_PER_PRODUCT} documents`,
      );
    }
  }

  private async assertPhotoOwnedByProduct(
    productId: number,
    photoId: number,
  ): Promise<void> {
    const photo = await this.prisma.photo.findFirst({
      where: { id: photoId, productId },
    });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }
  }

  private async assertDocumentOwnedByProduct(
    productId: number,
    documentId: number,
  ): Promise<void> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, productId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
  }

  private loadProductPhotos(productId: number) {
    return this.prisma.photo.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private loadProductDocuments(productId: number) {
    return this.prisma.document.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private assertExactIdPermutation(
    requestedIds: number[],
    currentIds: number[],
    fieldName: string,
  ): void {
    if (requestedIds.length !== currentIds.length) {
      throw new BadRequestException(
        `${fieldName} must include every current id exactly once`,
      );
    }

    const currentSet = new Set(currentIds);
    const seen = new Set<number>();

    for (const id of requestedIds) {
      if (!currentSet.has(id)) {
        throw new BadRequestException(`${fieldName} contains unknown id ${id}`);
      }
      if (seen.has(id)) {
        throw new BadRequestException(`${fieldName} contains duplicate id ${id}`);
      }
      seen.add(id);
    }
  }
}

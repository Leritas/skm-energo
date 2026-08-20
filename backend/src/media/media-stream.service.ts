import {
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  MediaVisibilityService,
  type DocumentWithOwner,
  type PhotoWithOwner,
} from './media-visibility.service';
import { MediaStorageService } from './media-storage.service';
import { createReadStream } from 'node:fs';

const OWNER_INCLUDE = {
  product: {
    include: {
      manufacturer: true,
      category: true,
    },
  },
  newsArticle: true,
  category: true,
} as const;

@Injectable()
export class MediaStreamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorageService,
    private readonly visibility: MediaVisibilityService,
  ) {}

  async getPhoto(id: number, userId?: number): Promise<StreamableFile> {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: OWNER_INCLUDE,
    });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.assertCanReadPhoto(photo, userId);

    const stream = createReadStream(this.storage.photoPath(photo.storedName));
    return new StreamableFile(stream, {
      type: photo.mimeType,
      disposition: 'inline',
    });
  }

  async getDocument(id: number, userId?: number): Promise<StreamableFile> {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: OWNER_INCLUDE,
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.assertCanReadDocument(document, userId);

    const stream = createReadStream(
      this.storage.documentPath(document.storedName),
    );
    return new StreamableFile(stream, {
      type: document.mimeType,
      disposition: this.attachmentDisposition(document.filename),
    });
  }

  private async assertCanReadPhoto(
    photo: PhotoWithOwner,
    userId?: number,
  ): Promise<void> {
    if (this.visibility.isPhotoOwnerPublic(photo)) {
      return;
    }

    const canPreview = await this.visibility.canPreviewUnpublished(userId);
    if (!canPreview) {
      throw new NotFoundException('Photo not found');
    }
  }

  private async assertCanReadDocument(
    document: DocumentWithOwner,
    userId?: number,
  ): Promise<void> {
    if (this.visibility.isDocumentOwnerPublic(document)) {
      return;
    }

    const canPreview = await this.visibility.canPreviewUnpublished(userId);
    if (!canPreview) {
      throw new NotFoundException('Document not found');
    }
  }

  private attachmentDisposition(filename: string): string {
    const encoded = encodeURIComponent(filename);
    return `attachment; filename*=UTF-8''${encoded}`;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AttachedFile } from '@skm/specs';
import type { Document, Photo } from '@prisma/client';

@Injectable()
export class MediaUrlService {
  constructor(private readonly configService: ConfigService) {}

  photoUrl(id: number): string {
    return `${this.publicBase()}/photos/${id}`;
  }

  documentUrl(id: number): string {
    return `${this.publicBase()}/documents/${id}`;
  }

  toAttachedPhoto(photo: Photo): AttachedFile {
    return {
      id: photo.id,
      url: this.photoUrl(photo.id),
      filename: photo.filename,
      sizeBytes: photo.sizeBytes,
      mimeType: photo.mimeType,
    };
  }

  toAttachedDocument(document: Document): AttachedFile {
    return {
      id: document.id,
      url: this.documentUrl(document.id),
      filename: document.filename,
      sizeBytes: document.sizeBytes,
      mimeType: document.mimeType,
    };
  }

  private publicBase(): string {
    return this.configService.getOrThrow<string>('MEDIA_PUBLIC_BASE').replace(
      /\/$/,
      '',
    );
  }
}

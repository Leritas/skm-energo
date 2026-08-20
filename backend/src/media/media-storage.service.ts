import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  DOCUMENT_MAX_BYTES,
  extensionForMimeType,
  isDocumentMimeType,
  isPhotoMimeType,
  PHOTO_MAX_BYTES,
} from './media.constants';

@Injectable()
export class MediaStorageService {
  private readonly uploadRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadRoot = this.configService.get<string>(
      'MEDIA_UPLOAD_DIR',
      './uploads',
    );
    mkdirSync(this.photoDir(), { recursive: true });
    mkdirSync(this.documentDir(), { recursive: true });
  }

  photoDir(): string {
    return join(this.uploadRoot, 'photos');
  }

  documentDir(): string {
    return join(this.uploadRoot, 'documents');
  }

  photoPath(storedName: string): string {
    return join(this.photoDir(), storedName);
  }

  documentPath(storedName: string): string {
    return join(this.documentDir(), storedName);
  }

  async deletePhoto(storedName: string): Promise<void> {
    await this.safeUnlink(this.photoPath(storedName));
  }

  async deleteDocument(storedName: string): Promise<void> {
    await this.safeUnlink(this.documentPath(storedName));
  }

  photoMulterOptions(): MulterOptions {
    return this.createMulterOptions('photo', PHOTO_MAX_BYTES, isPhotoMimeType);
  }

  documentMulterOptions(): MulterOptions {
    return this.createMulterOptions(
      'document',
      DOCUMENT_MAX_BYTES,
      isDocumentMimeType,
    );
  }

  private createMulterOptions(
    kind: 'photo' | 'document',
    maxBytes: number,
    isAllowedMime: (mimeType: string) => boolean,
  ): MulterOptions {
    const destination = kind === 'photo' ? this.photoDir() : this.documentDir();

    return {
      storage: diskStorage({
        destination,
        filename: (_req, file, callback) => {
          try {
            const extension = extensionForMimeType(file.mimetype);
            callback(null, `${randomUUID()}${extension}`);
          } catch (error) {
            callback(error as Error, '');
          }
        },
      }),
      limits: { fileSize: maxBytes },
      fileFilter: (_req, file, callback) => {
        if (!isAllowedMime(file.mimetype)) {
          callback(new Error(`Unsupported mime type: ${file.mimetype}`), false);
          return;
        }
        callback(null, true);
      },
    };
  }

  private async safeUnlink(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

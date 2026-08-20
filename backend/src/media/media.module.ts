import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DocumentsController } from './documents.controller';
import { MediaStorageService } from './media-storage.service';
import { MediaStreamService } from './media-stream.service';
import { MediaUploadService } from './media-upload.service';
import { MediaUrlService } from './media-url.service';
import { MediaVisibilityService } from './media-visibility.service';
import { DocumentFileInterceptor } from './document-file.interceptor';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { PhotoFileInterceptor } from './photo-file.interceptor';
import { PhotosController } from './photos.controller';

@Module({
  imports: [AuthModule],
  controllers: [PhotosController, DocumentsController],
  providers: [
    MediaStorageService,
    MediaUrlService,
    MediaVisibilityService,
    MediaUploadService,
    MediaStreamService,
    OptionalJwtAuthGuard,
    PhotoFileInterceptor,
    DocumentFileInterceptor,
  ],
  exports: [
    MediaStorageService,
    MediaUrlService,
    MediaUploadService,
    MediaStreamService,
    PhotoFileInterceptor,
    DocumentFileInterceptor,
  ],
})
export class MediaModule {}

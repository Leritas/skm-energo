import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DocumentsController } from './documents.controller';
import { MediaStorageService } from './media-storage.service';
import { MediaStreamService } from './media-stream.service';
import { MediaUploadService } from './media-upload.service';
import { MediaUrlService } from './media-url.service';
import { MediaVisibilityService } from './media-visibility.service';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
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
  ],
  exports: [
    MediaStorageService,
    MediaUrlService,
    MediaUploadService,
    MediaStreamService,
  ],
})
export class MediaModule {}

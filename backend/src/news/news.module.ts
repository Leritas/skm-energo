import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { NewsAdminController } from './news-admin.controller';
import { NewsAdminService } from './news-admin.service';
import { NewsController } from './news.controller';
import { NewsMediaAdminService } from './news-media-admin.service';
import { NewsService } from './news.service';

@Module({
  imports: [MediaModule],
  controllers: [NewsController, NewsAdminController],
  providers: [NewsService, NewsAdminService, NewsMediaAdminService],
})
export class NewsModule {}

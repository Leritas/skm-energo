import { Module } from '@nestjs/common';
import { NewsAdminController } from './news-admin.controller';
import { NewsAdminService } from './news-admin.service';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  controllers: [NewsController, NewsAdminController],
  providers: [NewsService, NewsAdminService],
})
export class NewsModule {}

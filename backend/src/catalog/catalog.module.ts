import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { CatalogAdminController } from './catalog-admin.controller';
import { CatalogAdminService } from './catalog-admin.service';
import { CategoryAdminService } from './category-admin.service';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ProductAdminService } from './product-admin.service';
import { ProductMediaAdminService } from './product-media-admin.service';

@Module({
  imports: [MediaModule],
  controllers: [CatalogController, CatalogAdminController],
  providers: [
    CatalogService,
    CatalogAdminService,
    CategoryAdminService,
    ProductAdminService,
    ProductMediaAdminService,
  ],
})
export class CatalogModule {}

import { Module } from '@nestjs/common';
import { CatalogAdminController } from './catalog-admin.controller';
import { CatalogAdminService } from './catalog-admin.service';
import { CategoryAdminService } from './category-admin.service';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ProductAdminService } from './product-admin.service';

@Module({
  controllers: [CatalogController, CatalogAdminController],
  providers: [
    CatalogService,
    CatalogAdminService,
    CategoryAdminService,
    ProductAdminService,
  ],
})
export class CatalogModule {}

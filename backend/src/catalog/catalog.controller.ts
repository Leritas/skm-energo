import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/auth/public.decorator';
import { CatalogService } from './catalog.service';
import {
  CatalogCategoryQueryDto,
  CatalogCategoryResponseDto,
  CatalogFilterQueryDto,
  CatalogManufacturerResponseDto,
  CatalogProductDetailResponseDto,
  CatalogProductListItemResponseDto,
  CatalogSimilarQueryDto,
} from './dto/catalog.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get('manufacturers')
  @ApiOkResponse({ type: CatalogManufacturerResponseDto, isArray: true })
  listManufacturers() {
    return this.catalogService.listManufacturers();
  }

  @Public()
  @Get('categories')
  @ApiOkResponse({ type: CatalogCategoryResponseDto, isArray: true })
  getCategories(@Query() query: CatalogCategoryQueryDto) {
    return this.catalogService.getCategoryTree(query.manufacturer ?? null);
  }

  @Public()
  @Get('products')
  @ApiOkResponse({ type: CatalogProductListItemResponseDto, isArray: true })
  listProducts(@Query() query: CatalogFilterQueryDto) {
    return this.catalogService.listProducts(
      query.category ?? null,
      query.manufacturer ?? null,
    );
  }

  @Public()
  @Get('products/:slug/similar')
  @ApiOkResponse({ type: CatalogProductListItemResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Product not found' })
  listSimilarProducts(
    @Param('slug') slug: string,
    @Query() query: CatalogSimilarQueryDto,
  ) {
    return this.catalogService.listSimilarProducts(slug, query.limit ?? 3);
  }

  @Public()
  @Get('products/:slug')
  @ApiOkResponse({ type: CatalogProductDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }
}

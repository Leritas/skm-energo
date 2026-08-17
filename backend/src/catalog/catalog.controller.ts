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
  CatalogProductDetailResponseDto,
  CatalogProductListItemResponseDto,
} from './dto/catalog.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

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
  @Get('products/:slug')
  @ApiOkResponse({ type: CatalogProductDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }
}

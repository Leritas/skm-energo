import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentFileInterceptor } from '../media/document-file.interceptor';
import { PhotoFileInterceptor } from '../media/photo-file.interceptor';
import { Permission, CATALOG_SECTION_PERMISSIONS } from '@skm/specs';
import {
  CurrentUser,
  type JwtPayloadUser,
} from '../common/auth/current-user.decorator';
import { PermissionsService } from '../common/permissions/permissions.service';
import { RequireAnyPermissions } from '../common/permissions/require-any-permissions.decorator';
import { RequirePermissions } from '../common/permissions/require-permissions.decorator';
import { CatalogAdminService } from './catalog-admin.service';
import { CategoryAdminService } from './category-admin.service';
import { ProductAdminService } from './product-admin.service';
import { CategoryMediaAdminService } from './category-media-admin.service';
import { ProductMediaAdminService } from './product-media-admin.service';
import {
  AttachedFileItemResponseDto,
  AttachedFileListResponseDto,
} from './dto/product-media-response.dto';
import {
  ReorderProductDocumentsDto,
  ReorderProductPhotosDto,
} from './dto/reorder-product-media.dto';
import { AdminCategoryDto } from './dto/admin-category.dto';
import { AdminManufacturerDto } from './dto/admin-manufacturer.dto';
import {
  AdminProductAssignmentOptionsDto,
  AdminProductDto,
} from './dto/admin-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListCategoriesAdminQueryDto } from './dto/list-categories-admin-query.dto';
import { ListManufacturersAdminQueryDto } from './dto/list-manufacturers-admin-query.dto';
import { ListProductsAdminQueryDto } from './dto/list-products-admin-query.dto';
import { CategoryCoverPhotoResponseDto } from './dto/category-cover-photo-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const MANUFACTURER_READ_PERMISSIONS = [
  Permission.hasAccessToCatalog,
  Permission.canManageManufacturers,
] as const;

const CATEGORY_READ_PERMISSIONS = [
  Permission.hasAccessToCatalog,
  Permission.canManageCategories,
] as const;

const PRODUCT_READ_PERMISSIONS = [
  Permission.hasAccessToCatalog,
  Permission.canManageProducts,
] as const;

@ApiTags('admin-catalog')
@ApiBearerAuth()
@Controller('admin/catalog')
export class CatalogAdminController {
  constructor(
    private readonly catalogAdminService: CatalogAdminService,
    private readonly categoryAdminService: CategoryAdminService,
    private readonly productAdminService: ProductAdminService,
    private readonly productMediaAdminService: ProductMediaAdminService,
    private readonly categoryMediaAdminService: CategoryMediaAdminService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get('access')
  @RequireAnyPermissions(...CATALOG_SECTION_PERMISSIONS)
  @ApiOkResponse({
    description: 'Confirms the caller may access the admin catalog area',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
  })
  checkAccess() {
    return { ok: true };
  }

  @Get('manufacturers')
  @RequireAnyPermissions(...MANUFACTURER_READ_PERMISSIONS)
  @ApiOkResponse({ type: AdminManufacturerDto, isArray: true })
  listManufacturers(@Query() query: ListManufacturersAdminQueryDto) {
    return this.catalogAdminService.listManufacturers(query.includeArchived);
  }

  @Post('manufacturers')
  @RequirePermissions(Permission.canManageManufacturers)
  @ApiCreatedResponse({ type: AdminManufacturerDto })
  @ApiConflictResponse({ description: 'Manufacturer slug already exists' })
  createManufacturer(@Body() dto: CreateManufacturerDto) {
    return this.catalogAdminService.create(dto);
  }

  @Patch('manufacturers/:id')
  @RequirePermissions(Permission.canManageManufacturers)
  @ApiOkResponse({ type: AdminManufacturerDto })
  @ApiConflictResponse({ description: 'Manufacturer slug already exists' })
  updateManufacturer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateManufacturerDto,
  ) {
    return this.catalogAdminService.update(id, dto);
  }

  @Delete('manufacturers/:id')
  @RequirePermissions(Permission.canManageManufacturers)
  @ApiOkResponse({ type: AdminManufacturerDto })
  @ApiConflictResponse({
    description: 'Manufacturer has products and cannot be archived',
  })
  archiveManufacturer(@Param('id', ParseIntPipe) id: number) {
    return this.catalogAdminService.softDelete(id);
  }

  @Post('manufacturers/:id/restore')
  @RequirePermissions(Permission.canManageManufacturers)
  @ApiOkResponse({ type: AdminManufacturerDto })
  restoreManufacturer(@Param('id', ParseIntPipe) id: number) {
    return this.catalogAdminService.restore(id);
  }

  @Get('categories')
  @RequireAnyPermissions(...CATEGORY_READ_PERMISSIONS)
  @ApiOkResponse({ type: AdminCategoryDto, isArray: true })
  listCategories(@Query() query: ListCategoriesAdminQueryDto) {
    return this.categoryAdminService.listCategories(query.includeArchived);
  }

  @Post('categories')
  @RequirePermissions(Permission.canManageCategories)
  @ApiCreatedResponse({ type: AdminCategoryDto })
  @ApiConflictResponse({ description: 'Category slug already exists' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryAdminService.create(dto);
  }

  @Patch('categories/:id')
  @RequirePermissions(Permission.canManageCategories)
  @ApiOkResponse({ type: AdminCategoryDto })
  @ApiConflictResponse({ description: 'Category slug already exists' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    const permissions = await this.permissionsService.getUserPermissions(
      user.userId,
    );
    return this.categoryAdminService.update(id, dto, permissions);
  }

  @Delete('categories/:id')
  @RequirePermissions(Permission.canManageCategories)
  @ApiOkResponse({ type: AdminCategoryDto })
  @ApiConflictResponse({
    description: 'Category has children or products and cannot be archived',
  })
  archiveCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryAdminService.softDelete(id);
  }

  @Post('categories/:id/restore')
  @RequirePermissions(Permission.canManageCategories)
  @ApiOkResponse({ type: AdminCategoryDto })
  restoreCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryAdminService.restore(id);
  }

  @Post('categories/:categoryId/cover-photo')
  @RequirePermissions(Permission.canManageCategories)
  @UseInterceptors(PhotoFileInterceptor)
  @ApiCreatedResponse({ type: CategoryCoverPhotoResponseDto })
  uploadCategoryCoverPhoto(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.categoryMediaAdminService.replaceCoverPhoto(categoryId, file);
  }

  @Delete('categories/:categoryId/cover-photo')
  @RequirePermissions(Permission.canManageCategories)
  @HttpCode(204)
  @ApiNoContentResponse()
  async deleteCategoryCoverPhoto(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<void> {
    await this.categoryMediaAdminService.deleteCoverPhoto(categoryId);
  }

  @Get('products')
  @RequireAnyPermissions(...PRODUCT_READ_PERMISSIONS)
  @ApiOkResponse({ type: AdminProductDto, isArray: true })
  listProducts(@Query() query: ListProductsAdminQueryDto) {
    return this.productAdminService.listProducts(query.includeArchived);
  }

  @Get('products/options')
  @RequireAnyPermissions(...PRODUCT_READ_PERMISSIONS)
  @ApiOkResponse({ type: AdminProductAssignmentOptionsDto })
  listProductAssignmentOptions() {
    return this.productAdminService.listAssignmentOptions();
  }

  @Get('products/:id')
  @RequireAnyPermissions(...PRODUCT_READ_PERMISSIONS)
  @ApiOkResponse({ type: AdminProductDto })
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productAdminService.getById(id);
  }

  @Post('products')
  @RequirePermissions(Permission.canManageProducts)
  @ApiCreatedResponse({ type: AdminProductDto })
  @ApiConflictResponse({ description: 'Product SKU already exists' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.productAdminService.create(dto);
  }

  @Patch('products/:id')
  @RequirePermissions(Permission.canManageProducts)
  @ApiOkResponse({ type: AdminProductDto })
  @ApiConflictResponse({ description: 'Product SKU or slug already exists' })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    const permissions = await this.permissionsService.getUserPermissions(
      user.userId,
    );
    return this.productAdminService.update(id, dto, permissions);
  }

  @Delete('products/:id')
  @RequirePermissions(Permission.canManageProducts)
  @ApiOkResponse({ type: AdminProductDto })
  archiveProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productAdminService.softDelete(id);
  }

  @Post('products/:id/restore')
  @RequirePermissions(Permission.canManageProducts)
  @ApiOkResponse({ type: AdminProductDto })
  restoreProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productAdminService.restore(id);
  }

  @Post('products/:productId/photos')
  @RequirePermissions(Permission.canManageProducts)
  @UseInterceptors(PhotoFileInterceptor)
  @ApiCreatedResponse({ type: AttachedFileItemResponseDto })
  uploadProductPhoto(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.productMediaAdminService.uploadPhoto(productId, file);
  }

  @Delete('products/:productId/photos/:photoId')
  @RequirePermissions(Permission.canManageProducts)
  @HttpCode(204)
  @ApiNoContentResponse()
  async deleteProductPhoto(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ): Promise<void> {
    await this.productMediaAdminService.deletePhoto(productId, photoId);
  }

  @Put('products/:productId/photos/order')
  @RequirePermissions(Permission.canManageProducts)
  @ApiOkResponse({ type: AttachedFileListResponseDto })
  reorderProductPhotos(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: ReorderProductPhotosDto,
  ) {
    return this.productMediaAdminService.reorderPhotos(productId, dto.photoIds);
  }

  @Post('products/:productId/documents')
  @RequirePermissions(Permission.canManageProducts)
  @UseInterceptors(DocumentFileInterceptor)
  @ApiCreatedResponse({ type: AttachedFileItemResponseDto })
  uploadProductDocument(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.productMediaAdminService.uploadDocument(productId, file);
  }

  @Delete('products/:productId/documents/:documentId')
  @RequirePermissions(Permission.canManageProducts)
  @HttpCode(204)
  @ApiNoContentResponse()
  async deleteProductDocument(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
  ): Promise<void> {
    await this.productMediaAdminService.deleteDocument(productId, documentId);
  }

  @Put('products/:productId/documents/order')
  @RequirePermissions(Permission.canManageProducts)
  @ApiOkResponse({ type: AttachedFileListResponseDto })
  reorderProductDocuments(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: ReorderProductDocumentsDto,
  ) {
    return this.productMediaAdminService.reorderDocuments(
      productId,
      dto.documentIds,
    );
  }
}

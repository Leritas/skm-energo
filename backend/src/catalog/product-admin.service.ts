import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hasAbsoluteControl, type Permission } from '@skm/specs';
import { PrismaService } from '../prisma/prisma.service';
import {
  normalizeProductSpecs,
  parseProductSpecs,
} from './catalog-specs';
import { AdminProductDto } from './dto/admin-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { nextUniqueProductSlug, slugifyProductTitle } from './product-slug';

type ProductRow = Prisma.ProductGetPayload<{
  include: { manufacturer: true; category: true };
}>;

const PRODUCT_RELATIONS = {
  manufacturer: true,
  category: true,
} as const;

@Injectable()
export class ProductAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(includeArchived: boolean): Promise<AdminProductDto[]> {
    const rows = await this.prisma.product.findMany({
      where: includeArchived ? undefined : { deletedAt: null },
      orderBy: { title: 'asc' },
      include: PRODUCT_RELATIONS,
    });

    return rows.map((row) => this.toDto(row));
  }

  async listAssignmentOptions() {
    const [manufacturers, categories] = await Promise.all([
      this.prisma.manufacturer.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        select: { id: true, slug: true, name: true },
      }),
      this.prisma.category.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        select: { id: true, slug: true, name: true },
      }),
    ]);

    return { manufacturers, categories };
  }

  async getById(id: number): Promise<AdminProductDto> {
    return this.toDto(await this.findByIdOrThrow(id));
  }

  async create(dto: CreateProductDto): Promise<AdminProductDto> {
    await this.assertManufacturerAvailable(dto.manufacturerId);
    await this.assertCategoryAvailable(dto.categoryId);
    await this.assertSkuAvailable(dto.sku);

    const row = await this.prisma.product.create({
      data: {
        slug: await this.allocateSlug(dto.title),
        title: dto.title.trim(),
        sku: dto.sku.trim(),
        description: dto.description.trim(),
        specs: normalizeProductSpecs(dto.specs) as unknown as Prisma.InputJsonValue,
        pdfHref: this.normalizeText(dto.pdfHref ?? null),
        badges: [],
        similarSlugs: [],
        seoTitle: this.normalizeText(dto.seoTitle ?? null),
        seoDescription: this.normalizeText(dto.seoDescription ?? null),
        manufacturerId: dto.manufacturerId,
        categoryId: dto.categoryId,
        isPublished: dto.isPublished ?? false,
      },
      include: PRODUCT_RELATIONS,
    });

    return this.toDto(row);
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    actorPermissions: readonly Permission[],
  ): Promise<AdminProductDto> {
    const product = await this.findByIdOrThrow(id);

    if (dto.slug !== undefined && dto.slug !== product.slug) {
      if (!hasAbsoluteControl(actorPermissions)) {
        throw new ForbiddenException(
          'Only users with absolute control can change a product slug',
        );
      }
      await this.assertSlugAvailable(dto.slug);
    }

    if (dto.sku !== undefined && dto.sku !== product.sku) {
      await this.assertSkuAvailable(dto.sku);
    }

    if (dto.manufacturerId !== undefined) {
      await this.assertManufacturerAvailable(dto.manufacturerId);
    }

    if (dto.categoryId !== undefined) {
      await this.assertCategoryAvailable(dto.categoryId);
    }

    const row = await this.prisma.product.update({
      where: { id },
      data: {
        slug: dto.slug,
        title: dto.title?.trim(),
        sku: dto.sku?.trim(),
        description: dto.description?.trim(),
        specs:
          dto.specs === undefined
            ? undefined
            : (normalizeProductSpecs(dto.specs) as unknown as Prisma.InputJsonValue),
        pdfHref: this.optionalText(dto.pdfHref),
        seoTitle: this.optionalText(dto.seoTitle),
        seoDescription: this.optionalText(dto.seoDescription),
        manufacturerId: dto.manufacturerId,
        categoryId: dto.categoryId,
        isPublished: dto.isPublished,
      },
      include: PRODUCT_RELATIONS,
    });

    return this.toDto(row);
  }

  async softDelete(id: number): Promise<AdminProductDto> {
    const product = await this.findByIdOrThrow(id);

    if (product.deletedAt) {
      throw new BadRequestException('Product is already archived');
    }

    const row = await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
      include: PRODUCT_RELATIONS,
    });

    return this.toDto(row);
  }

  async restore(id: number): Promise<AdminProductDto> {
    const product = await this.findByIdOrThrow(id);

    if (!product.deletedAt) {
      throw new BadRequestException('Product is not archived');
    }

    if (product.manufacturer.deletedAt) {
      throw new BadRequestException('Manufacturer is not available');
    }

    if (product.category.deletedAt) {
      throw new BadRequestException('Category is not available');
    }

    const row = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
      include: PRODUCT_RELATIONS,
    });

    return this.toDto(row);
  }

  private async findByIdOrThrow(id: number): Promise<ProductRow> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_RELATIONS,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private async allocateSlug(title: string): Promise<string> {
    const base = slugifyProductTitle(title);
    const rows = await this.prisma.product.findMany({
      where: {
        OR: [{ slug: base }, { slug: { startsWith: `${base}-` } }],
      },
      select: { slug: true },
    });

    return nextUniqueProductSlug(
      base,
      new Set(rows.map((row) => row.slug)),
    );
  }

  private async assertSkuAvailable(sku: string) {
    const existing = await this.prisma.product.findUnique({
      where: { sku },
    });
    if (existing) {
      throw new ConflictException('Product SKU already exists');
    }
  }

  private async assertSlugAvailable(slug: string) {
    const existing = await this.prisma.product.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Product slug already exists');
    }
  }

  private async assertManufacturerAvailable(manufacturerId: number) {
    const manufacturer = await this.prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });
    if (!manufacturer || manufacturer.deletedAt) {
      throw new BadRequestException('Manufacturer is not available');
    }
  }

  private async assertCategoryAvailable(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category || category.deletedAt) {
      throw new BadRequestException('Category is not available');
    }
  }

  private optionalText(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    return this.normalizeText(value);
  }

  private normalizeText(value: string | null): string | null {
    if (value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toDto(row: ProductRow): AdminProductDto {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      sku: row.sku,
      description: row.description,
      specs: parseProductSpecs(row.specs),
      pdfHref: row.pdfHref,
      badges: row.badges,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      manufacturerId: row.manufacturerId,
      manufacturerSlug: row.manufacturer.slug,
      manufacturerName: row.manufacturer.name,
      categoryId: row.categoryId,
      categorySlug: row.category.slug,
      categoryName: row.category.name,
      isPublished: row.isPublished,
      deletedAt: row.deletedAt?.toISOString() ?? null,
    };
  }
}

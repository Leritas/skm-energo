import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Photo } from '@prisma/client';
import type { AttachedFile } from '@skm/specs';
import { hasAbsoluteControl, type Permission } from '@skm/specs';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';
import { wouldCreateCategoryCycle } from './category-admin-tree';
import { AdminCategoryDto } from './dto/admin-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type CategoryRow = Prisma.CategoryGetPayload<{
  include: typeof CATEGORY_ADMIN_INCLUDE;
}>;

const ACTIVE_CHILD_WHERE = { deletedAt: null } as const;

const CATEGORY_ADMIN_INCLUDE = {
  _count: {
    select: {
      products: true,
      children: { where: ACTIVE_CHILD_WHERE },
    },
  },
  photos: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
} as const;

@Injectable()
export class CategoryAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly urls: MediaUrlService,
  ) {}

  async listCategories(includeArchived: boolean): Promise<AdminCategoryDto[]> {
    const rows = await this.prisma.category.findMany({
      where: includeArchived ? undefined : { deletedAt: null },
      orderBy: { name: 'asc' },
      include: CATEGORY_ADMIN_INCLUDE,
    });

    return rows.map((row) => this.toDto(row));
  }

  async create(dto: CreateCategoryDto): Promise<AdminCategoryDto> {
    await this.assertSlugAvailable(dto.slug);
    await this.assertParentAvailable(dto.parentId ?? null);

    const row = await this.prisma.category.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        description: this.normalizeText(dto.description ?? null),
        seoTitle: this.normalizeText(dto.seoTitle ?? null),
        seoDescription: this.normalizeText(dto.seoDescription ?? null),
        parentId: dto.parentId ?? null,
        isPublished: dto.isPublished ?? false,
      },
      include: CATEGORY_ADMIN_INCLUDE,
    });

    return this.toDto(row);
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
    actorPermissions: readonly Permission[],
  ): Promise<AdminCategoryDto> {
    const category = await this.findByIdOrThrow(id);

    if (dto.slug !== undefined && dto.slug !== category.slug) {
      if (!hasAbsoluteControl(actorPermissions)) {
        throw new ForbiddenException(
          'Only users with absolute control can change a category slug',
        );
      }
      await this.assertSlugAvailable(dto.slug);
    }

    if (dto.parentId !== undefined) {
      await this.assertParentAvailable(dto.parentId, id);
    }

    const row = await this.prisma.category.update({
      where: { id },
      data: {
        slug: dto.slug,
        name: dto.name,
        description: this.optionalText(dto.description),
        seoTitle: this.optionalText(dto.seoTitle),
        seoDescription: this.optionalText(dto.seoDescription),
        parentId: dto.parentId,
        isPublished: dto.isPublished,
      },
      include: CATEGORY_ADMIN_INCLUDE,
    });

    return this.toDto(row);
  }

  async softDelete(id: number): Promise<AdminCategoryDto> {
    const category = await this.findByIdOrThrow(id);

    if (category.deletedAt) {
      throw new BadRequestException('Category is already archived');
    }

    const [childCount, productCount] = await Promise.all([
      this.prisma.category.count({
        where: { parentId: id, ...ACTIVE_CHILD_WHERE },
      }),
      this.prisma.product.count({ where: { categoryId: id } }),
    ]);

    if (childCount > 0) {
      throw new ConflictException(
        'Cannot archive category while child categories exist',
      );
    }
    if (productCount > 0) {
      throw new ConflictException(
        'Cannot archive category while products reference it',
      );
    }

    const row = await this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
      include: CATEGORY_ADMIN_INCLUDE,
    });

    return this.toDto(row);
  }

  async restore(id: number): Promise<AdminCategoryDto> {
    const category = await this.findByIdOrThrow(id);

    if (!category.deletedAt) {
      throw new BadRequestException('Category is not archived');
    }

    await this.assertParentAvailable(category.parentId);

    const row = await this.prisma.category.update({
      where: { id },
      data: { deletedAt: null },
      include: CATEGORY_ADMIN_INCLUDE,
    });

    return this.toDto(row);
  }

  private async findByIdOrThrow(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private async assertSlugAvailable(slug: string) {
    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }
  }

  private async assertParentAvailable(
    parentId: number | null,
    categoryId?: number,
  ) {
    if (parentId === null) {
      return;
    }

    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
    });
    if (!parent || parent.deletedAt) {
      throw new BadRequestException('Parent category is not available');
    }

    if (categoryId === undefined) {
      return;
    }

    const categories = await this.prisma.category.findMany({
      select: { id: true, parentId: true },
    });
    if (wouldCreateCategoryCycle(categories, categoryId, parentId)) {
      throw new BadRequestException(
        'Category cannot be nested under itself or a descendant',
      );
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

  private toDto(row: CategoryRow): AdminCategoryDto {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      parentId: row.parentId,
      isPublished: row.isPublished,
      deletedAt: row.deletedAt?.toISOString() ?? null,
      productCount: row._count.products,
      childCount: row._count.children,
      coverPhoto: this.toCoverPhoto(row.photos),
    };
  }

  private toCoverPhoto(photos: Photo[]): AttachedFile | null {
    const cover = photos[0];
    return cover ? this.urls.toAttachedPhoto(cover) : null;
  }
}

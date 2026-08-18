import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  filterProductsByCatalogFilter,
  filterVisibleCategoryTree,
  getDescendantCategorySlugs,
  type CatalogCategoryNode,
  type CatalogProductRef,
} from './catalog-tree';

export interface CatalogCategoryDto {
  slug: string;
  label: string;
  children?: CatalogCategoryDto[];
}

export interface CatalogProductListItemDto {
  slug: string;
  title: string;
  manufacturerSlug: string;
  categorySlug: string;
  sku: string;
  badges: string[];
}

export interface CatalogProductDetailDto extends CatalogProductListItemDto {
  description: string;
  specs: Array<{ label: string; value: string }>;
  pdfHref: string | null;
}

export interface CatalogManufacturerDto {
  slug: string;
  label: string;
}

const PUBLIC_MANUFACTURER_WHERE = {
  isPublished: true,
  deletedAt: null,
} as const;

const PUBLIC_CATEGORY_WHERE = {
  isPublished: true,
  deletedAt: null,
} as const;

const PUBLIC_PRODUCT_WHERE = {
  manufacturer: PUBLIC_MANUFACTURER_WHERE,
  category: PUBLIC_CATEGORY_WHERE,
} as const;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategoryTree(
    manufacturerSlug: string | null,
  ): Promise<CatalogCategoryDto[]> {
    await this.assertManufacturerExists(manufacturerSlug);

    const [categories, products] = await Promise.all([
      this.loadCategoryTree(),
      this.loadProductRefs(),
    ]);

    return filterVisibleCategoryTree(categories, products, manufacturerSlug);
  }

  async listManufacturers(): Promise<CatalogManufacturerDto[]> {
    const rows = await this.prisma.manufacturer.findMany({
      where: PUBLIC_MANUFACTURER_WHERE,
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({
      slug: row.slug,
      label: row.name,
    }));
  }

  async listProducts(
    categorySlug: string | null,
    manufacturerSlug: string | null,
  ): Promise<CatalogProductListItemDto[]> {
    await this.assertManufacturerExists(manufacturerSlug);
    if (categorySlug) {
      await this.assertCategoryExists(categorySlug);
    }

    const [categories, products] = await Promise.all([
      this.loadCategoryTree(),
      this.loadProductRefs(),
    ]);

    const filtered = filterProductsByCatalogFilter(
      products,
      categories,
      categorySlug,
      manufacturerSlug,
    );

    const rows = await this.prisma.product.findMany({
      where: {
        slug: { in: filtered.map((item) => item.slug) },
        ...PUBLIC_PRODUCT_WHERE,
      },
      include: {
        manufacturer: true,
        category: true,
      },
      orderBy: { title: 'asc' },
    });

    return rows.map((row) => this.toListItem(row));
  }

  async getProductBySlug(slug: string): Promise<CatalogProductDetailDto> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        manufacturer: true,
        category: true,
      },
    });

    if (
      !product ||
      !this.isPublicManufacturer(product.manufacturer) ||
      !this.isPublicCategory(product.category)
    ) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...this.toListItem(product),
      description: product.description,
      specs: this.parseSpecs(product.specs),
      pdfHref: product.pdfHref,
    };
  }

  async searchProducts(
    query: string,
    categorySlug: string | null,
    manufacturerSlug: string | null,
    limit = 50,
  ): Promise<CatalogProductListItemDto[]> {
    const term = query.trim();
    if (!term) {
      return [];
    }

    await this.assertManufacturerExists(manufacturerSlug);
    if (categorySlug) {
      await this.assertCategoryExists(categorySlug);
    }

    let categorySlugs: string[] | null = null;
    if (categorySlug) {
      const categories = await this.loadCategoryTree();
      categorySlugs = getDescendantCategorySlugs(categories, categorySlug);
    }

    const pattern = `%${term}%`;
    const categoryFilter = categorySlugs
      ? Prisma.sql`AND c.slug IN (${Prisma.join(categorySlugs)})`
      : Prisma.empty;
    const manufacturerFilter = manufacturerSlug
      ? Prisma.sql`AND m.slug = ${manufacturerSlug}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      Array<{
        slug: string;
        title: string;
        sku: string;
        badges: string[];
        manufacturerSlug: string;
        categorySlug: string;
      }>
    >(Prisma.sql`
      SELECT
        p.slug,
        p.title,
        p.sku,
        p.badges,
        m.slug AS "manufacturerSlug",
        c.slug AS "categorySlug"
      FROM "Product" p
      INNER JOIN "Manufacturer" m ON p."manufacturerId" = m.id
      INNER JOIN "Category" c ON p."categoryId" = c.id
      WHERE (
        p.title ILIKE ${pattern}
        OR p.sku ILIKE ${pattern}
        OR m.name ILIKE ${pattern}
        OR p.title % ${term}
        OR p.sku % ${term}
        OR m.name % ${term}
      )
      ${categoryFilter}
      ${manufacturerFilter}
      AND m."isPublished" = true
      AND m."deletedAt" IS NULL
      AND c."isPublished" = true
      AND c."deletedAt" IS NULL
      ORDER BY GREATEST(
        similarity(p.title, ${term}),
        similarity(p.sku, ${term}),
        similarity(m.name, ${term})
      ) DESC,
      p.title ASC
      LIMIT ${limit}
    `);

    return rows.map((row) =>
      this.toListItem({
        slug: row.slug,
        title: row.title,
        sku: row.sku,
        badges: row.badges,
        manufacturer: { slug: row.manufacturerSlug },
        category: { slug: row.categorySlug },
      }),
    );
  }

  async listSimilarProducts(
    slug: string,
    limit = 3,
  ): Promise<CatalogProductListItemDto[]> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: {
        slug: true,
        categoryId: true,
        manufacturerId: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const rows = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        manufacturerId: { not: product.manufacturerId },
        slug: { not: slug },
        ...PUBLIC_PRODUCT_WHERE,
      },
      include: {
        manufacturer: true,
        category: true,
      },
      orderBy: { title: 'asc' },
      take: limit,
    });

    return rows.map((row) => this.toListItem(row));
  }

  private async loadCategoryTree(): Promise<CatalogCategoryNode[]> {
    const rows = await this.prisma.category.findMany({
      where: PUBLIC_CATEGORY_WHERE,
      orderBy: [{ parentId: 'asc' }, { id: 'asc' }],
    });

    const nodes = new Map<
      number,
      CatalogCategoryNode & { childIds: number[] }
    >();

    for (const row of rows) {
      nodes.set(row.id, {
        slug: row.slug,
        label: row.name,
        childIds: [],
      });
    }

    const roots: CatalogCategoryNode[] = [];

    for (const row of rows) {
      const node = nodes.get(row.id)!;

      if (row.parentId === null) {
        roots.push(node);
        continue;
      }

      const parent = nodes.get(row.parentId);
      if (parent) {
        parent.childIds.push(row.id);
      }
    }

    function attachChildren(
      node: CatalogCategoryNode & { childIds: number[] },
    ): CatalogCategoryNode {
      const children = node.childIds
        .map((id) => nodes.get(id))
        .filter(
          (item): item is CatalogCategoryNode & { childIds: number[] } =>
            item !== undefined,
        )
        .map(attachChildren);

      return {
        slug: node.slug,
        label: node.label,
        children: children.length ? children : undefined,
      };
    }

    return roots.map(attachChildren);
  }

  private async loadProductRefs(): Promise<CatalogProductRef[]> {
    const rows = await this.prisma.product.findMany({
      where: PUBLIC_PRODUCT_WHERE,
      select: {
        slug: true,
        category: { select: { slug: true } },
        manufacturer: { select: { slug: true } },
      },
    });

    return rows.map((row) => ({
      slug: row.slug,
      categorySlug: row.category.slug,
      manufacturerSlug: row.manufacturer.slug,
    }));
  }

  private toListItem(row: {
    slug: string;
    title: string;
    sku: string;
    badges: string[];
    manufacturer: { slug: string };
    category: { slug: string };
  }): CatalogProductListItemDto {
    return {
      slug: row.slug,
      title: row.title,
      sku: row.sku,
      badges: row.badges,
      manufacturerSlug: row.manufacturer.slug,
      categorySlug: row.category.slug,
    };
  }

  private parseSpecs(value: unknown): Array<{ label: string; value: string }> {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((item) => {
      if (
        typeof item === 'object' &&
        item !== null &&
        'label' in item &&
        'value' in item &&
        typeof item.label === 'string' &&
        typeof item.value === 'string'
      ) {
        return [{ label: item.label, value: item.value }];
      }
      return [];
    });
  }

  private async assertManufacturerExists(
    manufacturerSlug: string | null,
  ): Promise<void> {
    if (!manufacturerSlug) {
      return;
    }

    const manufacturer = await this.prisma.manufacturer.findFirst({
      where: { slug: manufacturerSlug, ...PUBLIC_MANUFACTURER_WHERE },
    });
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }
  }

  private isPublicManufacturer(manufacturer: {
    isPublished: boolean;
    deletedAt: Date | null;
  }): boolean {
    return manufacturer.isPublished && manufacturer.deletedAt === null;
  }

  private isPublicCategory(category: {
    isPublished: boolean;
    deletedAt: Date | null;
  }): boolean {
    return category.isPublished && category.deletedAt === null;
  }

  private async assertCategoryExists(categorySlug: string): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: { slug: categorySlug, ...PUBLIC_CATEGORY_WHERE },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }
}

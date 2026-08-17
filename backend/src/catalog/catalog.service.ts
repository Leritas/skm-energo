import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  filterProductsByCatalogFilter,
  filterVisibleCategoryTree,
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
  similarSlugs: string[];
}

export interface CatalogManufacturerDto {
  slug: string;
  label: string;
}

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
      where: { slug: { in: filtered.map((item) => item.slug) } },
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

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...this.toListItem(product),
      description: product.description,
      specs: this.parseSpecs(product.specs),
      pdfHref: product.pdfHref,
      similarSlugs: product.similarSlugs,
    };
  }

  private async loadCategoryTree(): Promise<CatalogCategoryNode[]> {
    const rows = await this.prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { id: 'asc' }],
    });

    const nodes = new Map<number, CatalogCategoryNode & { childIds: number[] }>();

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
        typeof item === 'object'
        && item !== null
        && 'label' in item
        && 'value' in item
        && typeof item.label === 'string'
        && typeof item.value === 'string'
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

    const manufacturer = await this.prisma.manufacturer.findUnique({
      where: { slug: manufacturerSlug },
    });
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }
  }

  private async assertCategoryExists(categorySlug: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }
}

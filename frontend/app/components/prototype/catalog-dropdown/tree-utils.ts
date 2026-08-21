import type { CatalogCategory } from '~/types/catalog';

export type PrototypeCategoryTreeRow = {
  category: CatalogCategory;
  depth: number;
  hasChildren: boolean;
};

export function flattenCategoryTree(
  categories: CatalogCategory[],
  expandedSlugs: Set<string>,
  depth = 0,
): PrototypeCategoryTreeRow[] {
  const rows: PrototypeCategoryTreeRow[] = [];

  for (const category of categories) {
    const hasChildren = Boolean(category.children?.length);
    rows.push({ category, depth, hasChildren });

    if (hasChildren && expandedSlugs.has(category.slug)) {
      rows.push(
        ...flattenCategoryTree(
          category.children ?? [],
          expandedSlugs,
          depth + 1,
        ),
      );
    }
  }

  return rows;
}

export function collectExpandableSlugs(
  categories: CatalogCategory[],
): string[] {
  const slugs: string[] = [];

  for (const category of categories) {
    if (category.children?.length) {
      slugs.push(category.slug);
      slugs.push(...collectExpandableSlugs(category.children));
    }
  }

  return slugs;
}

export {
  findCategoryBySlug,
  getCategoryChildren,
} from './usePrototypeDropdownNav';

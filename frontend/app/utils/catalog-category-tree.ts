import type { CatalogCategory } from '~/types/catalog';

export type CatalogCategoryTreeRow = {
  category: CatalogCategory;
  depth: number;
  hasChildren: boolean;
};

export function flattenCatalogCategoryTree(
  categories: CatalogCategory[],
  expandedSlugs: Set<string>,
  depth = 0,
): CatalogCategoryTreeRow[] {
  const rows: CatalogCategoryTreeRow[] = [];

  for (const category of categories) {
    const hasChildren = Boolean(category.children?.length);
    rows.push({ category, depth, hasChildren });

    if (hasChildren && expandedSlugs.has(category.slug)) {
      rows.push(
        ...flattenCatalogCategoryTree(
          category.children ?? [],
          expandedSlugs,
          depth + 1,
        ),
      );
    }
  }

  return rows;
}

export function collectExpandableCategorySlugs(
  categories: CatalogCategory[],
): string[] {
  const slugs: string[] = [];

  for (const category of categories) {
    if (category.children?.length) {
      slugs.push(category.slug);
      slugs.push(...collectExpandableCategorySlugs(category.children));
    }
  }

  return slugs;
}

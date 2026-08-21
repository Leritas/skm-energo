import type { CatalogCategory } from '~/types/catalog';

/** PROTOTYPE — which manufacturers have products in category subtree */
export type PrototypeCatalogCategory = CatalogCategory & {
  manufacturerSlugs?: string[];
  children?: PrototypeCatalogCategory[];
};

export function filterPrototypeCategoryTree(
  categories: PrototypeCatalogCategory[],
  manufacturerSlug: string | null,
): PrototypeCatalogCategory[] {
  if (!manufacturerSlug) {
    return categories;
  }

  return categories
    .map((category) => filterPrototypeCategoryNode(category, manufacturerSlug))
    .filter(
      (category): category is PrototypeCatalogCategory => category !== null,
    );
}

function filterPrototypeCategoryNode(
  category: PrototypeCatalogCategory,
  manufacturerSlug: string,
): PrototypeCatalogCategory | null {
  const filteredChildren = category.children
    ?.map((child) => filterPrototypeCategoryNode(child, manufacturerSlug))
    .filter((child): child is PrototypeCatalogCategory => child !== null);

  const hasDirect =
    category.manufacturerSlugs?.includes(manufacturerSlug) ?? false;
  const hasChildren = Boolean(filteredChildren?.length);

  if (!hasDirect && !hasChildren) {
    return null;
  }

  return {
    ...category,
    children: filteredChildren?.length ? filteredChildren : undefined,
  };
}

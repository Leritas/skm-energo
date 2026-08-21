import type {
  CatalogBreadcrumb,
  CatalogCategory,
  CatalogManufacturer,
} from '~/types/catalog';

export const MIN_CATALOG_SEARCH_LENGTH = 2;

export function isCatalogSearchActive(query: string): boolean {
  return query.trim().length >= MIN_CATALOG_SEARCH_LENGTH;
}

export function findCategoryBySlug(
  categories: CatalogCategory[],
  targetSlug: string,
): CatalogCategory | null {
  for (const category of categories) {
    if (category.slug === targetSlug) {
      return category;
    }
    if (category.children?.length) {
      const found = findCategoryBySlug(category.children, targetSlug);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function getCategoryLabel(
  slug: string,
  categories: CatalogCategory[] | null | undefined,
): string {
  return findCategoryBySlug(categories ?? [], slug)?.label ?? slug;
}

export function findCategoryPath(
  categories: CatalogCategory[],
  targetSlug: string,
  trail: CatalogCategory[] = [],
): CatalogCategory[] | null {
  for (const category of categories) {
    const nextTrail = [...trail, category];
    if (category.slug === targetSlug) {
      return nextTrail;
    }
    if (category.children?.length) {
      const found = findCategoryPath(category.children, targetSlug, nextTrail);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function resolveCategoryFromPath(
  pathSegments: string[],
  categories: CatalogCategory[],
): {
  categorySlug: string | null;
  isValid: boolean;
} {
  if (!pathSegments.length) {
    return { categorySlug: null, isValid: true };
  }

  const categorySlug = pathSegments[pathSegments.length - 1];
  const isValid = findCategoryPath(categories, categorySlug) !== null;
  return { categorySlug, isValid };
}

export function parseManufacturerQuery(
  value: unknown,
  manufacturers: CatalogManufacturer[] | null | undefined,
): string | null {
  if (typeof value !== 'string' || !value) {
    return null;
  }
  return manufacturers?.some((item) => item.slug === value) ? value : null;
}

export function getManufacturerLabel(
  slug: string,
  manufacturers: CatalogManufacturer[] | null | undefined,
): string {
  return manufacturers?.find((item) => item.slug === slug)?.label ?? slug;
}

export function parseSearchQuery(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

export function buildCatalogUrl(
  categorySlug?: string | null,
  manufacturerSlug?: string | null,
  searchQuery?: string | null,
): string {
  const path = categorySlug ? `/catalog/${categorySlug}` : '/catalog';
  const params = new URLSearchParams();

  if (manufacturerSlug) {
    params.set('manufacturer', manufacturerSlug);
  }
  if (searchQuery?.trim()) {
    params.set('q', searchQuery.trim());
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function getCategoryBreadcrumbs(
  categorySlug: string | null,
  manufacturerSlug: string | null,
  categories: CatalogCategory[],
  options?: { linkLeaf?: boolean },
): CatalogBreadcrumb[] {
  const items: CatalogBreadcrumb[] = [
    { label: 'Главная', to: '/' },
    { label: 'Каталог', to: buildCatalogUrl(null, manufacturerSlug) },
  ];

  if (!categorySlug) {
    return items;
  }

  const path = findCategoryPath(categories, categorySlug);
  if (!path) {
    return items;
  }

  for (const category of path) {
    const isLast = category.slug === categorySlug;
    items.push({
      label: category.label,
      to:
        !isLast || options?.linkLeaf
          ? buildCatalogUrl(category.slug, manufacturerSlug)
          : undefined,
    });
  }

  return items;
}

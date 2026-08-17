import type {
  CatalogBreadcrumb,
  CatalogCategory,
  CatalogManufacturer,
  CatalogProductDetail,
  CatalogProductListItem,
} from '~/types/catalog'

export function findCategoryPath(
  categories: CatalogCategory[],
  targetSlug: string,
  trail: CatalogCategory[] = [],
): CatalogCategory[] | null {
  for (const category of categories) {
    const nextTrail = [...trail, category]
    if (category.slug === targetSlug) {
      return nextTrail
    }
    if (category.children?.length) {
      const found = findCategoryPath(category.children, targetSlug, nextTrail)
      if (found) {
        return found
      }
    }
  }
  return null
}

export function resolveCategoryFromPath(
  pathSegments: string[],
  categories: CatalogCategory[],
): {
  categorySlug: string | null
  isValid: boolean
} {
  if (!pathSegments.length) {
    return { categorySlug: null, isValid: true }
  }

  const categorySlug = pathSegments[pathSegments.length - 1]
  const isValid = findCategoryPath(categories, categorySlug) !== null
  return { categorySlug, isValid }
}

export function parseManufacturerQuery(
  value: unknown,
  manufacturers: CatalogManufacturer[] | null | undefined,
): string | null {
  if (typeof value !== 'string' || !value) {
    return null
  }
  return manufacturers?.some((item) => item.slug === value) ? value : null
}

export function getManufacturerLabel(
  slug: string,
  manufacturers: CatalogManufacturer[] | null | undefined,
): string {
  return manufacturers?.find((item) => item.slug === slug)?.label ?? slug
}

export function buildCatalogUrl(
  categorySlug?: string | null,
  manufacturerSlug?: string | null,
): string {
  const path = categorySlug ? `/catalog/${categorySlug}` : '/catalog'
  if (!manufacturerSlug) {
    return path
  }
  return `${path}?manufacturer=${manufacturerSlug}`
}

export function getCategoryBreadcrumbs(
  categorySlug: string | null,
  manufacturerSlug: string | null,
  categories: CatalogCategory[],
): CatalogBreadcrumb[] {
  const items: CatalogBreadcrumb[] = [
    { label: 'Главная', to: '/' },
    { label: 'Каталог', to: buildCatalogUrl(null, manufacturerSlug) },
  ]

  if (!categorySlug) {
    return items
  }

  const path = findCategoryPath(categories, categorySlug)
  if (!path) {
    return items
  }

  for (const category of path) {
    const isLast = category.slug === categorySlug
    items.push({
      label: category.label,
      to: isLast ? undefined : buildCatalogUrl(category.slug, manufacturerSlug),
    })
  }

  return items
}

export function mapProductBadges(
  badges: string[] | undefined,
): Array<'pdf' | 'new' | 'onRequest'> | undefined {
  if (!badges?.length) {
    return undefined
  }
  return badges.filter(
    (badge): badge is 'pdf' | 'new' | 'onRequest' =>
      badge === 'pdf' || badge === 'new' || badge === 'onRequest',
  )
}

export type {
  CatalogBreadcrumb,
  CatalogCategory,
  CatalogManufacturer,
  CatalogProductDetail,
  CatalogProductListItem,
}

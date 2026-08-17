import { CATALOG_CATEGORIES, type CatalogCategory } from '~/constants/catalog-categories'
import {
  MANUFACTURERS,
  MOCK_PRODUCTS,
  type Manufacturer,
  type MockProduct,
} from '~/constants/catalog-mocks'

export interface CatalogBreadcrumb {
  label: string
  to?: string
}

function findCategoryPath(
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

export function getManufacturerBySlug(slug: string): Manufacturer | undefined {
  return MANUFACTURERS.find((item) => item.slug === slug)
}

export function getManufacturerLabel(slug: string): string {
  return getManufacturerBySlug(slug)?.label ?? slug
}

export function getProductBySlug(slug: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((item) => item.slug === slug)
}

export function getDescendantSlugs(categorySlug: string): string[] {
  const path = findCategoryPath(CATALOG_CATEGORIES, categorySlug)
  if (!path) {
    return [categorySlug]
  }

  const node = path[path.length - 1]
  const slugs: string[] = [node.slug]

  function collect(children: CatalogCategory[] | undefined) {
    if (!children) {
      return
    }
    for (const child of children) {
      slugs.push(child.slug)
      collect(child.children)
    }
  }

  collect(node.children)
  return slugs
}

function productMatchesManufacturer(
  product: MockProduct,
  manufacturerSlug: string | null,
): boolean {
  return !manufacturerSlug || product.manufacturerSlug === manufacturerSlug
}

function productMatchesCategory(
  product: MockProduct,
  categorySlug: string | null,
): boolean {
  if (!categorySlug) {
    return true
  }
  return getDescendantSlugs(categorySlug).includes(product.categorySlug)
}

export function getFilteredProducts(
  categorySlug: string | null,
  manufacturerSlug: string | null,
): MockProduct[] {
  return MOCK_PRODUCTS.filter(
    (product) =>
      productMatchesManufacturer(product, manufacturerSlug)
      && productMatchesCategory(product, categorySlug),
  )
}

function categoryHasProducts(
  category: CatalogCategory,
  manufacturerSlug: string | null,
): boolean {
  const slugs = getDescendantSlugs(category.slug)
  return MOCK_PRODUCTS.some(
    (product) =>
      slugs.includes(product.categorySlug)
      && productMatchesManufacturer(product, manufacturerSlug),
  )
}

export function getVisibleCategoryTree(
  manufacturerSlug: string | null,
): CatalogCategory[] {
  function filterTree(categories: CatalogCategory[]): CatalogCategory[] {
    return categories
      .map((category) => {
        const children = category.children
          ? filterTree(category.children)
          : undefined
        const hasProducts = categoryHasProducts(category, manufacturerSlug)

        if (!hasProducts && !children?.length) {
          return null
        }

        return {
          ...category,
          children: children?.length ? children : undefined,
        }
      })
      .filter((item): item is CatalogCategory => item !== null)
  }

  return filterTree(CATALOG_CATEGORIES)
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
): CatalogBreadcrumb[] {
  const items: CatalogBreadcrumb[] = [
    { label: 'Главная', to: '/' },
    { label: 'Каталог', to: buildCatalogUrl(null, manufacturerSlug) },
  ]

  if (!categorySlug) {
    return items
  }

  const path = findCategoryPath(CATALOG_CATEGORIES, categorySlug)
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

export function getSimilarProducts(product: MockProduct, limit = 3): MockProduct[] {
  if (product.similarSlugs?.length) {
    return product.similarSlugs
      .map((slug) => getProductBySlug(slug))
      .filter((item): item is MockProduct => item !== undefined)
      .slice(0, limit)
  }

  return MOCK_PRODUCTS.filter(
    (item) =>
      item.slug !== product.slug
      && item.categorySlug === product.categorySlug
      && item.manufacturerSlug !== product.manufacturerSlug,
  ).slice(0, limit)
}

export function resolveCategoryFromPath(pathSegments: string[]): {
  categorySlug: string | null
  isValid: boolean
} {
  if (!pathSegments.length) {
    return { categorySlug: null, isValid: true }
  }

  const categorySlug = pathSegments[pathSegments.length - 1]
  const isValid = findCategoryPath(CATALOG_CATEGORIES, categorySlug) !== null
  return { categorySlug, isValid }
}

export { CATALOG_CATEGORIES, MANUFACTURERS, MOCK_PRODUCTS }

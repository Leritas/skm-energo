export interface CatalogCategory {
  slug: string
  label: string
  children?: CatalogCategory[]
}

export interface CatalogManufacturer {
  slug: string
  label: string
}

export type ProductBadge = 'pdf' | 'new' | 'onRequest'

export interface CatalogProductListItem {
  slug: string
  title: string
  manufacturerSlug: string
  categorySlug: string
  sku: string
  badges: string[]
}

export interface CatalogProductDetail extends CatalogProductListItem {
  description: string
  specs: Array<{ label: string; value: string }>
  pdfHref: string | null
  similarSlugs: string[]
}

export interface CatalogBreadcrumb {
  label: string
  to?: string
}

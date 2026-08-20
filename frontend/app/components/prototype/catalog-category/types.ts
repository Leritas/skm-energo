import type { ProductBadge } from '~/types/catalog';

export interface PrototypeSubcategory {
  slug: string;
  label: string;
  coverUrl: string | null;
}

export interface PrototypeProduct {
  slug: string;
  title: string;
  subcategorySlug: string;
  manufacturer: string;
  sku: string;
  badges: ProductBadge[];
  imageUrl: string | null;
}

export interface PrototypeCatalogCategoryPageData {
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; to?: string }>;
  subcategories: PrototypeSubcategory[];
  products: PrototypeProduct[];
}

export interface PrototypeCatalogCategoryVariantProps {
  data: PrototypeCatalogCategoryPageData;
}

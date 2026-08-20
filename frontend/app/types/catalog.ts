import type { AttachedFile } from '@skm/specs';

export interface CatalogCategory {
  slug: string;
  label: string;
  coverPhoto: AttachedFile | null;
  children?: CatalogCategory[];
}

export interface CatalogManufacturer {
  slug: string;
  label: string;
}

export type ProductBadge = 'pdf' | 'new' | 'onRequest';

export interface CatalogProductListItem {
  slug: string;
  title: string;
  manufacturerSlug: string;
  categorySlug: string;
  sku: string;
  badges: ProductBadge[];
  image: AttachedFile | null;
}

export interface CatalogProductDetail extends CatalogProductListItem {
  description: string;
  specs: Array<{ label: string; value: string }>;
  photos: AttachedFile[];
  documents: AttachedFile[];
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface CatalogBreadcrumb {
  label: string;
  to?: string;
}

export function formatAttachedFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }
  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

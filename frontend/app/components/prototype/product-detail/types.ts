import type { ProductBadge } from '~/types/catalog';

export interface PrototypeProductPhoto {
  url: string;
  filename: string;
}

export interface PrototypeProductDocument {
  id: string;
  url: string;
  filename: string;
  sizeBytes: number;
}

export interface PrototypeProductSpec {
  label: string;
  value: string;
}

export interface PrototypeSimilarProduct {
  slug: string;
  title: string;
  manufacturer: string;
  sku: string;
  badges: ProductBadge[];
  imageUrl: string | null;
}

export interface PrototypeProductDetailData {
  title: string;
  manufacturer: string;
  sku: string;
  badges: ProductBadge[];
  description: string;
  specs: PrototypeProductSpec[];
  photos: PrototypeProductPhoto[];
  documents: PrototypeProductDocument[];
  breadcrumbs: Array<{ label: string; to?: string }>;
  similarProducts: PrototypeSimilarProduct[];
}

export interface PrototypeProductDetailVariantProps {
  data: PrototypeProductDetailData;
}

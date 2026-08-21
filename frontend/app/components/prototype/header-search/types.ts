import type { ProductBadge } from '~/types/catalog';

/** PROTOTYPE — fixture row for header search UI exploration */
export interface PrototypeSearchProduct {
  slug: string;
  title: string;
  manufacturer: string;
  sku: string;
  categoryLabel: string;
  badges: ProductBadge[];
  imageUrl: string | null;
}

export interface PrototypeSearchState {
  query: string;
  isOpen: boolean;
  results: PrototypeSearchProduct[];
  isSearching: boolean;
}

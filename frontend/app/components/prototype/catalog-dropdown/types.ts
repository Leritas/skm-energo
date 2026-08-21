import type { CatalogManufacturer } from '~/types/catalog';
import type { PrototypeCatalogCategory } from './filter-prototype-tree';

export interface PrototypeCatalogDropdownData {
  manufacturers: CatalogManufacturer[];
  categories: PrototypeCatalogCategory[];
  activeManufacturerSlug: string | null;
}

export interface PrototypeCatalogDropdownVariantProps {
  data: PrototypeCatalogDropdownData;
}

export const PROTOTYPE_DROPDOWN_VARIANT_LABEL =
  'D3P — approved (#72, see catalog-header-dropdown-visual spec)';

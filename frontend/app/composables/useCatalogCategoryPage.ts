import type { InjectionKey } from 'vue';
import type {
  CatalogBreadcrumb,
  CatalogCategory,
  CatalogManufacturer,
  CatalogProductListItem,
} from '~/types/catalog';

export interface CatalogCategoryPageContext {
  categorySlug: Ref<string | null>;
  manufacturerSlug: Ref<string | null>;
  visibleCategories: Ref<CatalogCategory[] | null | undefined>;
  childCategories: Ref<CatalogCategory[]>;
  breadcrumbs: Ref<CatalogBreadcrumb[]>;
  manufacturers: Ref<CatalogManufacturer[] | null | undefined>;
  query: Ref<string>;
  page: Ref<number>;
  itemsPerPage: number;
  pageTitle: ComputedRef<string>;
  pageDescription: ComputedRef<string>;
  categoryTiles: ComputedRef<CatalogCategory[]>;
  categorySectionTitle: ComputedRef<string>;
  showCategorySection: ComputedRef<boolean>;
  showProductSection: ComputedRef<boolean>;
  showEmptyState: ComputedRef<boolean>;
  firstSectionMargin: ComputedRef<string>;
  emptyTitle: ComputedRef<string>;
  emptyDescription: ComputedRef<string>;
  isSearchActive: ComputedRef<boolean>;
  displayedProducts: ComputedRef<CatalogProductListItem[]>;
  pagedProducts: ComputedRef<CatalogProductListItem[]>;
  catalogUrl: (
    nextCategorySlug?: string | null,
    nextManufacturerSlug?: string | null,
    nextSearchQuery?: string | null,
  ) => string;
  manufacturerLabel: (slug: string) => string;
  handleManufacturerToggle: (slug: string | null) => void;
  handleSearchSubmit: (value: string) => Promise<void>;
}

export const catalogCategoryPageKey: InjectionKey<CatalogCategoryPageContext> =
  Symbol('catalogCategoryPage');

export function useCatalogCategoryPageContext(): CatalogCategoryPageContext {
  const context = inject(catalogCategoryPageKey);
  if (!context) {
    throw new Error(
      'CatalogCategoryPageView must be used within a catalog page',
    );
  }
  return context;
}

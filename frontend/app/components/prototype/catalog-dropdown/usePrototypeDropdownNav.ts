import { buildCatalogUrl } from '~/utils/catalog';
import type { PrototypeCatalogDropdownData } from './types';

export function usePrototypeDropdownNav(data: PrototypeCatalogDropdownData) {
  const selectedManufacturerSlug = ref<string | null>(
    data.activeManufacturerSlug,
  );

  function isManufacturerSelected(slug: string) {
    return selectedManufacturerSlug.value === slug;
  }

  /** Radio: click selected again → back to «all brands». */
  function toggleManufacturer(slug: string) {
    selectedManufacturerSlug.value = isManufacturerSelected(slug) ? null : slug;
  }

  function manufacturerCatalogUrl(slug: string) {
    return buildCatalogUrl(null, slug);
  }

  function categoryUrl(slug: string) {
    return buildCatalogUrl(slug || null, selectedManufacturerSlug.value);
  }

  const manufacturerState = computed(
    () => selectedManufacturerSlug.value ?? 'all',
  );

  return {
    selectedManufacturerSlug,
    isManufacturerSelected,
    toggleManufacturer,
    manufacturerCatalogUrl,
    categoryUrl,
    manufacturerState,
    manufacturers: data.manufacturers,
  };
}

export function getCategoryChildren(
  categories: PrototypeCatalogDropdownData['categories'],
  parentSlug: string | null,
) {
  if (!parentSlug) {
    return categories;
  }
  return findCategoryBySlug(categories, parentSlug)?.children ?? [];
}

export function findCategoryBySlug(
  categories: PrototypeCatalogDropdownData['categories'],
  slug: string,
) {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    if (category.children?.length) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

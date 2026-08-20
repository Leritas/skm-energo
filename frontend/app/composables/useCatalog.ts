import {
  buildCatalogUrl,
  getManufacturerLabel,
  parseManufacturerQuery,
  parseSearchQuery,
} from '~/utils/catalog';

export async function useCatalog() {
  const route = useRoute();
  const { data: manufacturers } = await useCatalogManufacturers();

  const categoryPath = computed(() => {
    const slug = route.params.slug;
    if (!slug) {
      return [] as string[];
    }
    return Array.isArray(slug) ? slug : [slug];
  });

  const manufacturerSlug = computed(() =>
    parseManufacturerQuery(route.query.manufacturer, manufacturers.value),
  );

  const searchQuery = computed(() => parseSearchQuery(route.query.q));

  const categorySlugFromRoute = computed(() => {
    const segments = categoryPath.value;
    if (!segments.length) {
      return null;
    }
    return segments[segments.length - 1] ?? null;
  });

  const {
    tree: visibleCategories,
    breadcrumbs,
    childCategories,
    resolveFromPath,
  } = await useCatalogTaxonomy(manufacturerSlug, categorySlugFromRoute);

  const categoryResolution = computed(() =>
    resolveFromPath(categoryPath.value),
  );

  const categorySlug = computed(() => categoryResolution.value.categorySlug);
  const isValidCategory = computed(() => categoryResolution.value.isValid);

  const { data: products } = await useCatalogProducts(
    categorySlug,
    manufacturerSlug,
  );

  function catalogUrl(
    nextCategorySlug?: string | null,
    nextManufacturerSlug?: string | null,
    nextSearchQuery?: string | null,
  ) {
    const manufacturer =
      nextManufacturerSlug === undefined
        ? manufacturerSlug.value
        : nextManufacturerSlug;
    const search =
      nextSearchQuery === undefined ? searchQuery.value : nextSearchQuery;
    return buildCatalogUrl(nextCategorySlug, manufacturer, search);
  }

  async function setManufacturer(nextManufacturerSlug: string | null) {
    await navigateTo(
      buildCatalogUrl(null, nextManufacturerSlug, searchQuery.value),
    );
  }

  function manufacturerLabel(slug: string) {
    return getManufacturerLabel(slug, manufacturers.value);
  }

  return {
    manufacturers,
    categoryPath,
    categorySlug,
    isValidCategory,
    manufacturerSlug,
    searchQuery,
    visibleCategories,
    childCategories,
    products,
    breadcrumbs,
    catalogUrl,
    setManufacturer,
    manufacturerLabel,
  };
}

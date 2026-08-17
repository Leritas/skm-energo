import {
  buildCatalogUrl,
  getCategoryBreadcrumbs,
  getManufacturerLabel,
  parseManufacturerQuery,
  parseSearchQuery,
  resolveCategoryFromPath,
} from '~/utils/catalog';

export async function useCatalog() {
  const route = useRoute();
  const { data: manufacturers } = await useCatalogManufacturers();
  const { data: allCategories } = await useCatalogAllCategories();

  const categoryPath = computed(() => {
    const slug = route.params.slug;
    if (!slug) {
      return [] as string[];
    }
    return Array.isArray(slug) ? slug : [slug];
  });

  const categoryResolution = computed(() =>
    resolveCategoryFromPath(categoryPath.value, allCategories.value ?? []),
  );

  const categorySlug = computed(() => categoryResolution.value.categorySlug);
  const isValidCategory = computed(() => categoryResolution.value.isValid);

  const manufacturerSlug = computed(() =>
    parseManufacturerQuery(route.query.manufacturer, manufacturers.value),
  );

  const searchQuery = computed(() => parseSearchQuery(route.query.q));

  const { data: visibleCategories } =
    await useCatalogCategories(manufacturerSlug);
  const { data: products } = await useCatalogProducts(
    categorySlug,
    manufacturerSlug,
  );

  const breadcrumbs = computed(() =>
    getCategoryBreadcrumbs(
      categorySlug.value,
      manufacturerSlug.value,
      allCategories.value ?? [],
    ),
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
      buildCatalogUrl(
        categorySlug.value,
        nextManufacturerSlug,
        searchQuery.value,
      ),
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
    products,
    breadcrumbs,
    catalogUrl,
    setManufacturer,
    manufacturerLabel,
  };
}

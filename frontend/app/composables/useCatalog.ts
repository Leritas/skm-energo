import {
  buildCatalogUrl,
  getCategoryBreadcrumbs,
  getManufacturerLabel,
  parseManufacturerQuery,
  resolveCategoryFromPath,
} from '~/utils/catalog'

export async function useCatalog() {
  const route = useRoute()
  const { data: manufacturers } = useCatalogManufacturers()
  const { data: allCategories } = await useCatalogAllCategories()

  const categoryPath = computed(() => {
    const slug = route.params.slug
    if (!slug) {
      return [] as string[]
    }
    return Array.isArray(slug) ? slug : [slug]
  })

  const categorySlug = computed(
    () =>
      resolveCategoryFromPath(
        categoryPath.value,
        allCategories.value ?? [],
      ).categorySlug,
  )

  const isValidCategory = computed(() =>
    resolveCategoryFromPath(
      categoryPath.value,
      allCategories.value ?? [],
    ).isValid,
  )

  const manufacturerSlug = computed(() =>
    parseManufacturerQuery(route.query.manufacturer, manufacturers.value),
  )

  const { data: visibleCategories } = useCatalogCategories(manufacturerSlug)
  const { data: products } = useCatalogProducts(
    categorySlug,
    manufacturerSlug,
  )

  const breadcrumbs = computed(() =>
    getCategoryBreadcrumbs(
      categorySlug.value,
      manufacturerSlug.value,
      allCategories.value ?? [],
    ),
  )

  function catalogUrl(
    nextCategorySlug?: string | null,
    nextManufacturerSlug?: string | null,
  ) {
    const manufacturer =
      nextManufacturerSlug === undefined
        ? manufacturerSlug.value
        : nextManufacturerSlug
    return buildCatalogUrl(nextCategorySlug, manufacturer)
  }

  async function setManufacturer(nextManufacturerSlug: string | null) {
    await navigateTo(
      buildCatalogUrl(categorySlug.value, nextManufacturerSlug),
    )
  }

  function manufacturerLabel(slug: string) {
    return getManufacturerLabel(slug, manufacturers.value)
  }

  return {
    manufacturers,
    categoryPath,
    categorySlug,
    isValidCategory,
    manufacturerSlug,
    visibleCategories: computed(() => visibleCategories.value ?? []),
    products: computed(() => products.value ?? []),
    breadcrumbs,
    catalogUrl,
    setManufacturer,
    manufacturerLabel,
  }
}

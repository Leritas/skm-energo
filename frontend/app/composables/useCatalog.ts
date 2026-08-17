import {
  buildCatalogUrl,
  getCategoryBreadcrumbs,
  getFilteredProducts,
  getManufacturerBySlug,
  getVisibleCategoryTree,
  resolveCategoryFromPath,
} from '~/utils/catalog'

export function useCatalog() {
  const route = useRoute()

  const categoryPath = computed(() => {
    const slug = route.params.slug
    if (!slug) {
      return [] as string[]
    }
    return Array.isArray(slug) ? slug : [slug]
  })

  const categorySlug = computed(() =>
    resolveCategoryFromPath(categoryPath.value).categorySlug,
  )

  const isValidCategory = computed(() =>
    resolveCategoryFromPath(categoryPath.value).isValid,
  )

  const manufacturerSlug = computed(() => {
    const value = route.query.manufacturer
    if (typeof value !== 'string' || !value) {
      return null
    }
    return getManufacturerBySlug(value) ? value : null
  })

  const visibleCategories = computed(() =>
    getVisibleCategoryTree(manufacturerSlug.value),
  )

  const products = computed(() =>
    getFilteredProducts(categorySlug.value, manufacturerSlug.value),
  )

  const breadcrumbs = computed(() =>
    getCategoryBreadcrumbs(categorySlug.value, manufacturerSlug.value),
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

  return {
    categoryPath,
    categorySlug,
    isValidCategory,
    manufacturerSlug,
    visibleCategories,
    products,
    breadcrumbs,
    catalogUrl,
    setManufacturer,
  }
}

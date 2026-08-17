import type {
  CatalogCategory,
  CatalogManufacturer,
  CatalogProductDetail,
  CatalogProductListItem,
} from '~/types/catalog'

function buildCatalogQuery(
  params: Record<string, string | null | undefined>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value)
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function useCatalogManufacturers() {
  const { api } = useApi()

  return useAsyncData(
    'catalog-manufacturers',
    () =>
      api<CatalogManufacturer[]>('/catalog/manufacturers', { auth: false }),
  )
}

export async function useCatalogAllCategories() {
  const { api } = useApi()

  return await useAsyncData('catalog-all-categories', () =>
    api<CatalogCategory[]>('/catalog/categories', { auth: false }),
  )
}

export function useCatalogCategories(
  manufacturerSlug: MaybeRefOrGetter<string | null>,
) {
  const { api } = useApi()

  return useAsyncData(
    () => `catalog-categories-${toValue(manufacturerSlug) ?? 'all'}`,
    () =>
      api<CatalogCategory[]>(
        `/catalog/categories${buildCatalogQuery({ manufacturer: toValue(manufacturerSlug) ?? undefined })}`,
        { auth: false },
      ),
    { watch: [() => toValue(manufacturerSlug)] },
  )
}

export function useCatalogProducts(
  categorySlug: MaybeRefOrGetter<string | null>,
  manufacturerSlug: MaybeRefOrGetter<string | null>,
) {
  const { api } = useApi()

  return useAsyncData(
    () =>
      `catalog-products-${toValue(categorySlug) ?? 'all'}-${toValue(manufacturerSlug) ?? 'all'}`,
    () =>
      api<CatalogProductListItem[]>(
        `/catalog/products${buildCatalogQuery({
          category: toValue(categorySlug) ?? undefined,
          manufacturer: toValue(manufacturerSlug) ?? undefined,
        })}`,
        { auth: false },
      ),
    {
      watch: [
        () => toValue(categorySlug),
        () => toValue(manufacturerSlug),
      ],
    },
  )
}

export async function useCatalogProduct(slug: MaybeRefOrGetter<string>) {
  const { api } = useApi()

  return await useAsyncData(
    () => `catalog-product-${toValue(slug)}`,
    () =>
      api<CatalogProductDetail>(`/catalog/products/${toValue(slug)}`, {
        auth: false,
      }),
    { watch: [() => toValue(slug)] },
  )
}

export async function fetchSimilarProducts(
  similarSlugs: string[],
  limit = 3,
): Promise<CatalogProductListItem[]> {
  if (!similarSlugs.length) {
    return []
  }

  const { api } = useApi()
  const results = await Promise.all(
    similarSlugs.slice(0, limit).map(async (similarSlug) => {
      try {
        return await api<CatalogProductDetail>(
          `/catalog/products/${similarSlug}`,
          { auth: false },
        )
      }
      catch {
        return null
      }
    }),
  )

  return results.filter(
    (item): item is CatalogProductDetail => item !== null,
  )
}

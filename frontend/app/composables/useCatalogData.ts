import type {
  CatalogCategory,
  CatalogManufacturer,
  CatalogProductDetail,
  CatalogProductListItem,
} from '~/types/catalog';

function buildCatalogQuery(
  params: Record<string, string | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function useCatalogManufacturers() {
  const { api } = useApi();

  return await useAsyncData('catalog-manufacturers', () =>
    api<CatalogManufacturer[]>('/catalog/manufacturers', { auth: false }),
  );
}

export async function useCatalogAllCategories() {
  const { api } = useApi();

  return await useAsyncData('catalog-all-categories', () =>
    api<CatalogCategory[]>('/catalog/categories', { auth: false }),
  );
}

export async function useCatalogCategories(
  manufacturerSlug: MaybeRefOrGetter<string | null>,
) {
  const { api } = useApi();

  return await useAsyncData(
    () => `catalog-categories-${toValue(manufacturerSlug) ?? 'all'}`,
    () =>
      api<CatalogCategory[]>(
        `/catalog/categories${buildCatalogQuery({ manufacturer: toValue(manufacturerSlug) ?? undefined })}`,
        { auth: false },
      ),
    { watch: [() => toValue(manufacturerSlug)] },
  );
}

export async function useCatalogProducts(
  categorySlug: MaybeRefOrGetter<string | null>,
  manufacturerSlug: MaybeRefOrGetter<string | null>,
) {
  const { api } = useApi();

  return await useAsyncData(
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
      watch: [() => toValue(categorySlug), () => toValue(manufacturerSlug)],
    },
  );
}

export async function useCatalogProduct(slug: MaybeRefOrGetter<string>) {
  const { api } = useApi();

  return await useAsyncData(
    () => `catalog-product-${toValue(slug)}`,
    () =>
      api<CatalogProductDetail>(`/catalog/products/${toValue(slug)}`, {
        auth: false,
      }),
    { watch: [() => toValue(slug)] },
  );
}

export async function useCatalogSearch(
  searchQuery: MaybeRefOrGetter<string>,
  categorySlug: MaybeRefOrGetter<string | null>,
  manufacturerSlug: MaybeRefOrGetter<string | null>,
) {
  const { api } = useApi();

  return await useAsyncData(
    () => {
      const q = toValue(searchQuery).trim();
      return `catalog-search-${q}-${toValue(categorySlug) ?? 'all'}-${toValue(manufacturerSlug) ?? 'all'}`;
    },
    () => {
      const q = toValue(searchQuery).trim();
      if (!q) {
        return Promise.resolve([] as CatalogProductListItem[]);
      }

      return api<CatalogProductListItem[]>(
        `/catalog/search${buildCatalogQuery({
          q,
          category: toValue(categorySlug) ?? undefined,
          manufacturer: toValue(manufacturerSlug) ?? undefined,
        })}`,
        { auth: false },
      );
    },
    {
      watch: [
        () => toValue(searchQuery),
        () => toValue(categorySlug),
        () => toValue(manufacturerSlug),
      ],
    },
  );
}

export async function useCatalogSimilarProducts(
  slug: MaybeRefOrGetter<string>,
  limit = 3,
) {
  const { api } = useApi();

  return await useAsyncData(
    () => `catalog-similar-${toValue(slug)}-${limit}`,
    () =>
      api<CatalogProductListItem[]>(
        `/catalog/products/${toValue(slug)}/similar${buildCatalogQuery({ limit: String(limit) })}`,
        { auth: false },
      ),
    { watch: [() => toValue(slug)] },
  );
}

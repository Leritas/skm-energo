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

async function loadSimilarBySlugs(
  similarSlugs: string[],
  limit: number,
): Promise<CatalogProductListItem[]> {
  const { api } = useApi();
  const results = await Promise.allSettled(
    similarSlugs.slice(0, limit).map((similarSlug) =>
      api<CatalogProductDetail>(`/catalog/products/${similarSlug}`, {
        auth: false,
      }),
    ),
  );

  return results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  );
}

export async function fetchSimilarProducts(
  product: CatalogProductDetail,
  limit = 3,
): Promise<CatalogProductListItem[]> {
  if (product.similarSlugs.length) {
    const similar = await loadSimilarBySlugs(product.similarSlugs, limit);
    if (similar.length) {
      return similar;
    }
  }

  const { api } = useApi();
  const categoryProducts = await api<CatalogProductListItem[]>(
    `/catalog/products${buildCatalogQuery({ category: product.categorySlug })}`,
    { auth: false },
  );

  return categoryProducts
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.manufacturerSlug !== product.manufacturerSlug,
    )
    .slice(0, limit);
}

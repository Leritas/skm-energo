import type { CatalogCategory } from '~/types/catalog';
import {
  findCategoryPath,
  getCategoryBreadcrumbs,
  resolveCategoryFromPath,
} from '~/utils/catalog';

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

export async function useCatalogTaxonomy(
  manufacturerSlug: MaybeRefOrGetter<string | null>,
  categorySlug?: MaybeRefOrGetter<string | null>,
) {
  const { api } = useApi();

  const { data: tree, ...asyncData } = await useAsyncData(
    () => `catalog-taxonomy-${toValue(manufacturerSlug) ?? 'all'}`,
    () =>
      api<CatalogCategory[]>(
        `/catalog/categories${buildCatalogQuery({ manufacturer: toValue(manufacturerSlug) ?? undefined })}`,
        { auth: false },
      ),
    { watch: [() => toValue(manufacturerSlug)] },
  );

  function findPath(slug: string): CatalogCategory[] | null {
    return findCategoryPath(tree.value ?? [], slug);
  }

  const breadcrumbs = computed(() =>
    getCategoryBreadcrumbs(
      toValue(categorySlug) ?? null,
      toValue(manufacturerSlug),
      tree.value ?? [],
    ),
  );

  const childCategories = computed((): CatalogCategory[] => {
    const slug = toValue(categorySlug);
    if (!slug) {
      return tree.value ?? [];
    }
    const path = findPath(slug);
    if (!path) {
      return [];
    }
    return path[path.length - 1]?.children ?? [];
  });

  function isValidSlug(slug: string): boolean {
    return findPath(slug) !== null;
  }

  function resolveFromPath(pathSegments: string[]) {
    return resolveCategoryFromPath(pathSegments, tree.value ?? []);
  }

  return {
    tree,
    findPath,
    breadcrumbs,
    childCategories,
    isValidSlug,
    resolveFromPath,
    ...asyncData,
  };
}

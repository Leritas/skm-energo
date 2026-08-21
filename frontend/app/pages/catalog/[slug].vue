<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import { SITE } from '~/constants/site';
import {
  catalogCategoryPageKey,
  type CatalogCategoryPageContext,
} from '~/composables/useCatalogCategoryPage';
import {
  buildCatalogUrl,
  getManufacturerLabel,
  parseManufacturerQuery,
  parseSearchQuery,
} from '~/utils/catalog';

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

const categoryResolution = computed(() => resolveFromPath(categoryPath.value));

const categorySlug = computed(() => categoryResolution.value.categorySlug);
const isValidCategory = computed(() => categoryResolution.value.isValid);

if (!isValidCategory.value) {
  throw createError({ statusCode: 404, statusMessage: 'Категория не найдена' });
}

const { data: products } = await useCatalogProducts(
  categorySlug,
  manufacturerSlug,
);

const isSearchActive = computed(() => searchQuery.value.length > 0);
const query = ref(searchQuery.value);

watch(searchQuery, (value) => {
  query.value = value;
});

const { data: searchResults } = await useCatalogSearch(
  searchQuery,
  categorySlug,
  manufacturerSlug,
);

const page = ref(1);
const itemsPerPage = 8;

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

const pageTitle = computed(() => {
  if (isSearchActive.value) {
    return `Поиск: ${searchQuery.value}`;
  }
  if (!categorySlug.value) {
    return 'Каталог продукции';
  }
  const trail = breadcrumbs.value;
  return trail[trail.length - 1]?.label ?? 'Каталог';
});

const pageDescription = computed(() => {
  if (isSearchActive.value) {
    return `Результаты поиска «${searchQuery.value}» в каталоге ${SITE.name}.`;
  }
  if (manufacturerSlug.value) {
    return `Оборудование ${manufacturerLabel(manufacturerSlug.value)} в каталоге ${SITE.name}.`;
  }
  if (categorySlug.value) {
    return `Продукция раздела «${pageTitle.value}». Поставка под заказ, техническая документация.`;
  }
  return 'Каталог электрооборудования по категориям и производителям.';
});

useSeoMeta({
  title: computed(() => `${pageTitle.value} — ${SITE.name}`),
  description: pageDescription,
});

const displayedProducts = computed(() => {
  if (isSearchActive.value) {
    return searchResults.value ?? [];
  }
  return products.value ?? [];
});

const pagedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return displayedProducts.value.slice(start, start + itemsPerPage);
});

const categoryTiles = computed(() => {
  if (isSearchActive.value) {
    return [];
  }
  return childCategories.value ?? [];
});

const categorySectionTitle = computed(() =>
  categorySlug.value ? 'Подкатегории' : 'Категории',
);

const showCategorySection = computed(() => categoryTiles.value.length > 0);

const showProductSection = computed(() => {
  if (isSearchActive.value) {
    return displayedProducts.value.length > 0;
  }
  if (!categorySlug.value) {
    return false;
  }
  return displayedProducts.value.length > 0;
});

const showEmptyState = computed(() => {
  if (isSearchActive.value) {
    return displayedProducts.value.length === 0;
  }
  if (!categorySlug.value) {
    return categoryTiles.value.length === 0;
  }
  return !showCategorySection.value && !showProductSection.value;
});

const firstSectionMargin = computed(() =>
  manufacturerSlug.value ? 'mt-8' : 'mt-10',
);

const emptyTitle = computed(() =>
  isSearchActive.value ? 'Ничего не найдено' : 'Нет товаров',
);

const emptyDescription = computed(() => {
  if (isSearchActive.value) {
    return 'Измените запрос, сбросьте фильтр производителя или выберите другую категорию.';
  }
  return 'В этом разделе пока нет товаров. Выберите другую категорию или сбросьте фильтр производителя.';
});

watch([searchQuery, manufacturerSlug, categorySlug], () => {
  page.value = 1;
});

function handleManufacturerToggle(slug: string | null) {
  setManufacturer(slug);
}

async function handleSearchSubmit(value: string) {
  await navigateTo(
    buildCatalogUrl(null, manufacturerSlug.value, value.trim() || null),
  );
}

watch(query, async (value) => {
  if (!value.trim() && searchQuery.value) {
    await navigateTo(buildCatalogUrl(null, manufacturerSlug.value, null));
  }
});

provide(catalogCategoryPageKey, {
  categorySlug,
  manufacturerSlug,
  visibleCategories,
  childCategories,
  breadcrumbs,
  manufacturers,
  query,
  page,
  itemsPerPage,
  pageTitle,
  pageDescription,
  categoryTiles,
  categorySectionTitle,
  showCategorySection,
  showProductSection,
  showEmptyState,
  firstSectionMargin,
  emptyTitle,
  emptyDescription,
  isSearchActive,
  displayedProducts,
  pagedProducts,
  catalogUrl,
  manufacturerLabel,
  handleManufacturerToggle,
  handleSearchSubmit,
} satisfies CatalogCategoryPageContext);
</script>

<template>
  <CatalogCategoryPageView />
</template>

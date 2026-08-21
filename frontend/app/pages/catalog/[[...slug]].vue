<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { SITE } from '~/constants/site';

const {
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
  manufacturers,
} = await useCatalog();

if (!isValidCategory.value) {
  throw createError({ statusCode: 404, statusMessage: 'Категория не найдена' });
}

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
    catalogUrl(categorySlug.value, manufacturerSlug.value, value),
  );
}
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader :title="pageTitle" :description="pageDescription">
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div class="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside class="hidden lg:block">
          <h2
            class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900"
          >
            Категории
          </h2>
          <SkmCatalogSidebar
            :items="visibleCategories ?? []"
            :manufacturer-slug="manufacturerSlug"
            :active-category-slug="categorySlug"
          />
        </aside>

        <div>
          <SkmCatalogFilterBar
            v-model:query="query"
            :manufacturers="manufacturers ?? []"
            :active-manufacturer-slug="manufacturerSlug"
            @toggle-manufacturer="handleManufacturerToggle"
            @submit="handleSearchSubmit"
          />

          <div
            v-if="manufacturerSlug"
            class="mt-4 flex items-center gap-2 text-sm text-neutral-600"
          >
            <span>Фильтр:</span>
            <SkmBadge
              :label="manufacturerLabel(manufacturerSlug)"
              tone="accent"
              size="sm"
            />
            <button
              type="button"
              class="text-accent-600 hover:text-accent-700"
              @click="handleManufacturerToggle(null)"
            >
              Сбросить
            </button>
          </div>

          <section v-if="showCategorySection" :class="firstSectionMargin">
            <h2
              class="text-sm font-semibold uppercase tracking-wide text-neutral-900"
            >
              {{ categorySectionTitle }}
            </h2>
            <div class="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <SkmCatalogCategoryTile
                v-for="category in categoryTiles"
                :key="category.slug"
                :title="category.label"
                :to="catalogUrl(category.slug, manufacturerSlug)"
                :cover-url="category.coverPhoto?.url ?? null"
              />
            </div>
          </section>

          <section
            v-if="showProductSection"
            :class="showCategorySection ? 'mt-10' : firstSectionMargin"
          >
            <h2
              class="text-sm font-semibold uppercase tracking-wide text-neutral-900"
            >
              {{ isSearchActive ? 'Результаты поиска' : 'Товары' }}
            </h2>
            <div
              class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <SkmCatalogProductTile
                v-for="product in pagedProducts"
                :key="product.slug"
                :title="product.title"
                :to="`/product/${product.slug}`"
                :image-src="product.image?.url ?? null"
                :manufacturer="manufacturerLabel(product.manufacturerSlug)"
                :sku="product.sku"
                :badges="product.badges"
              />
            </div>
            <div
              v-if="displayedProducts.length > itemsPerPage"
              class="mt-8 flex justify-center"
            >
              <SkmPagination
                v-model:page="page"
                :total="displayedProducts.length"
                :items-per-page="itemsPerPage"
              />
            </div>
          </section>

          <SkmEmpty
            v-else-if="showEmptyState"
            :title="emptyTitle"
            :description="emptyDescription"
            :class="firstSectionMargin"
          />
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

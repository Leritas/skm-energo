<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { toProductCardBadges } from '~/components/ui/SkmProductCard/badgeDisplay';
import { SITE } from '~/constants/site';

const {
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

const emptyTitle = computed(() =>
  isSearchActive.value ? 'Ничего не найдено' : 'Нет товаров',
);

const showCategoryTiles = computed(
  () => !categorySlug.value && !isSearchActive.value,
);

const rootCategories = computed(() => visibleCategories.value ?? []);

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

          <h2
            class="mt-8 text-sm font-semibold uppercase tracking-wide text-neutral-900"
          >
            {{
              isSearchActive
                ? 'Результаты поиска'
                : categorySlug
                  ? 'Товары'
                  : 'Категории'
            }}
          </h2>

          <div
            v-if="showCategoryTiles && rootCategories.length"
            class="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            <SkmCategoryCard
              v-for="category in rootCategories"
              :key="category.slug"
              :title="category.label"
              :to="catalogUrl(category.slug, manufacturerSlug)"
              :image="category.coverPhoto?.url ?? null"
            />
          </div>

          <SkmEmpty
            v-else-if="!displayedProducts.length"
            :title="emptyTitle"
            :description="emptyDescription"
            class="mt-4"
          />

          <template v-else-if="displayedProducts.length">
            <div class="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <SkmProductCard
                v-for="product in pagedProducts"
                :key="product.slug"
                :title="product.title"
                :to="`/product/${product.slug}`"
                :image-src="product.image?.url ?? null"
                :manufacturer="manufacturerLabel(product.manufacturerSlug)"
                :sku="product.sku"
                :badges="toProductCardBadges(product.badges)"
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
          </template>
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

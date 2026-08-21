<script setup lang="ts">
import { useCatalogCategoryPageContext } from '~/composables/useCatalogCategoryPage';

const {
  categorySlug,
  manufacturerSlug,
  visibleCategories,
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
} = useCatalogCategoryPageContext();
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getManufacturerLabel } from '~/utils/catalog'
import { SITE } from '~/constants/site'

const {
  categorySlug,
  isValidCategory,
  manufacturerSlug,
  visibleCategories,
  products,
  breadcrumbs,
  setManufacturer,
} = useCatalog()

if (!isValidCategory.value) {
  throw createError({ statusCode: 404, statusMessage: 'Категория не найдена' })
}

const query = ref('')
const page = ref(1)
const itemsPerPage = 8

const pageTitle = computed(() => {
  if (!categorySlug.value) {
    return 'Каталог продукции'
  }
  const trail = breadcrumbs.value
  return trail[trail.length - 1]?.label ?? 'Каталог'
})

const pageDescription = computed(() => {
  if (manufacturerSlug.value) {
    return `Оборудование ${getManufacturerLabel(manufacturerSlug.value)} в каталоге ${SITE.name}.`
  }
  if (categorySlug.value) {
    return `Продукция раздела «${pageTitle.value}». Поставка под заказ, техническая документация.`
  }
  return 'Каталог электрооборудования по категориям и производителям.'
})

useSeoMeta({
  title: `${pageTitle.value} — ${SITE.name}`,
  description: pageDescription.value,
})

const filteredProducts = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) {
    return products.value
  }
  return products.value.filter(
    (product) =>
      product.title.toLowerCase().includes(q)
      || getManufacturerLabel(product.manufacturerSlug).toLowerCase().includes(q)
      || product.sku.toLowerCase().includes(q),
  )
})

const pagedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

watch([query, manufacturerSlug, categorySlug], () => {
  page.value = 1
})

function handleManufacturerToggle(slug: string | null) {
  setManufacturer(slug)
}
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        :title="pageTitle"
        :description="pageDescription"
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div class="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside class="hidden lg:block">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            Категории
          </h2>
          <CatalogSidebar
            :items="visibleCategories"
            :manufacturer-slug="manufacturerSlug"
            :active-category-slug="categorySlug"
          />
        </aside>

        <div>
          <CatalogFilterBar
            v-model:query="query"
            :active-manufacturer-slug="manufacturerSlug"
            @toggle-manufacturer="handleManufacturerToggle"
          />

          <div
            v-if="manufacturerSlug"
            class="mt-4 flex items-center gap-2 text-sm text-neutral-600"
          >
            <span>Фильтр:</span>
            <SkmBadge
              :label="getManufacturerLabel(manufacturerSlug)"
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

          <h2 class="mt-8 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            Товары
          </h2>

          <SkmEmpty
            v-if="!filteredProducts.length"
            title="Ничего не найдено"
            description="Измените запрос, сбросьте фильтр производителя или выберите другую категорию."
            class="mt-4"
          />

          <template v-else>
            <div class="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <SkmProductCard
                v-for="product in pagedProducts"
                :key="product.slug"
                :title="product.title"
                :to="`/product/${product.slug}`"
                :manufacturer="getManufacturerLabel(product.manufacturerSlug)"
                :sku="product.sku"
                :badges="product.badges ? [...product.badges] : undefined"
              />
            </div>
            <div
              v-if="filteredProducts.length > itemsPerPage"
              class="mt-8 flex justify-center"
            >
              <SkmPagination
                v-model:page="page"
                :total="filteredProducts.length"
                :items-per-page="itemsPerPage"
              />
            </div>
          </template>
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

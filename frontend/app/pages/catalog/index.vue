<script setup lang="ts">
import { computed, ref } from 'vue'
import { CATALOG_TREE } from '~/constants/navigation'
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `Каталог — ${SITE.name}`,
  description: 'Каталог продукции и производителей: MERSEN, CASRAM, Lampar, HIITIO.',
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Каталог' },
]

const query = ref('')
const activeChip = ref<string | null>(null)
const page = ref(1)
const itemsPerPage = 4

const manufacturerChips = CATALOG_TREE.map((item) => item.label)

const allProducts = [
  {
    title: 'Предохранитель NH00 160A',
    to: '/product/nh00-160a',
    manufacturer: 'MERSEN',
    sku: 'NH00-160',
    badges: ['pdf'] as const,
  },
  {
    title: 'Контактор C09 220V',
    to: '/product/c09-220',
    manufacturer: 'HIITIO',
    sku: 'C09-220',
    badges: ['new', 'onRequest'] as const,
  },
  {
    title: 'Рубильник 250A 3P',
    to: '/product/switch-250',
    manufacturer: 'MERSEN',
    sku: 'SW-250-3P',
    badges: ['pdf', 'onRequest'] as const,
  },
  {
    title: 'SPD Type 2 40kA',
    to: '/product/spd-t2-40',
    manufacturer: 'CASRAM',
    sku: 'SPD-T2-40',
  },
  {
    title: 'Лампа сигнальная LED',
    to: '/product/lamp-led',
    manufacturer: 'Lampar',
    sku: 'LED-22',
    badges: ['new'] as const,
  },
  {
    title: 'Держатель NH1',
    to: '/product/holder-nh1',
    manufacturer: 'MERSEN',
    sku: 'H-NH1',
    badges: ['pdf'] as const,
  },
]

const filteredProducts = computed(() => {
  const q = query.value.trim().toLowerCase()
  return allProducts.filter((product) => {
    if (activeChip.value && product.manufacturer !== activeChip.value) {
      return false
    }
    if (!q) {
      return true
    }
    return (
      product.title.toLowerCase().includes(q)
      || product.manufacturer.toLowerCase().includes(q)
      || product.sku.toLowerCase().includes(q)
    )
  })
})

const pagedProducts = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

watch([query, activeChip], () => {
  page.value = 1
})
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        title="Каталог продукции"
        description="Раздел в разработке. Ниже — производители и демо-карточки товаров на mock-данных."
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
          <CatalogSidebar :items="CATALOG_TREE" />
        </aside>

        <div>
          <CatalogFilterBar
            v-model:query="query"
            v-model:active-chip="activeChip"
            :chips="manufacturerChips"
          />

          <h2 class="mt-8 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            Производители
          </h2>
          <div class="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <SkmManufacturerCard
              v-for="item in CATALOG_TREE"
              :key="item.label"
              :name="item.label"
              :to="item.to ?? '/catalog'"
              :lines-count="item.children?.length"
            />
          </div>

          <h2 class="mt-12 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            Товары (demo)
          </h2>

          <SkmEmpty
            v-if="!filteredProducts.length"
            title="Ничего не найдено"
            description="Измените запрос или сбросьте фильтр производителя."
            class="mt-4"
          />

          <template v-else>
            <div class="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <SkmProductCard
                v-for="product in pagedProducts"
                :key="product.to"
                :title="product.title"
                :to="product.to"
                :manufacturer="product.manufacturer"
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

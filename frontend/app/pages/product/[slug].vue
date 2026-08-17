<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  getCategoryBreadcrumbs,
  getManufacturerLabel,
  getProductBySlug,
  getSimilarProducts,
} from '~/utils/catalog'
import { SITE } from '~/constants/site'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const product = computed(() => getProductBySlug(slug.value))

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Товар не найден' })
}

const similarProducts = computed(() =>
  product.value ? getSimilarProducts(product.value) : [],
)

useSeoMeta({
  title: () => `${product.value!.title} — ${SITE.name}`,
  description: () => product.value!.description,
})

const breadcrumbs = computed(() => {
  const item = product.value!
  return [
    ...getCategoryBreadcrumbs(item.categorySlug, null),
    { label: item.title },
  ]
})

const activeTab = ref('desc')
const tabItems = [
  { label: 'Описание', value: 'desc', content: '' },
  { label: 'Характеристики', value: 'specs', content: '' },
  { label: 'PDF', value: 'pdf', content: '' },
]

const pdfFilename = computed(() => {
  const href = product.value?.pdfHref
  if (!href) {
    return undefined
  }
  return href.split('/').pop() ?? 'datasheet.pdf'
})
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        :title="product!.title"
        :description="`${getManufacturerLabel(product!.manufacturerSlug)} · арт. ${product!.sku}`"
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div class="grid gap-10 lg:grid-cols-2">
        <SkmProductGallery
          :images="[]"
          :alt="product!.title"
        />

        <div>
          <div v-if="product!.badges?.length" class="mb-4 flex flex-wrap gap-2">
            <SkmBadge
              v-for="badge in product!.badges"
              :key="badge"
              :label="badge === 'pdf' ? 'PDF' : badge === 'new' ? 'Новинка' : 'Под заказ'"
              tone="neutral"
              size="sm"
            />
          </div>
          <p class="text-sm leading-relaxed text-neutral-600">
            {{ product!.description }}
          </p>
          <div class="mt-6">
            <SkmButton variant="primary" to="/contacts">
              Запросить поставку
            </SkmButton>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <SkmTabs v-model="activeTab" :items="tabItems" />
        <div class="mt-6">
          <p
            v-if="activeTab === 'desc'"
            class="text-sm leading-relaxed text-neutral-600"
          >
            {{ product!.description }}
          </p>
          <SkmSpecList
            v-else-if="activeTab === 'specs'"
            :items="product!.specs"
          />
          <div v-else-if="activeTab === 'pdf'">
            <SkmFileLink
              v-if="product!.pdfHref && pdfFilename"
              :href="product!.pdfHref"
              :filename="pdfFilename"
              size-label="PDF"
            />
            <p v-else class="text-sm text-neutral-500">
              Документация будет добавлена менеджером при запросе поставки.
            </p>
          </div>
        </div>
      </div>

      <div v-if="similarProducts.length" class="mt-16">
        <h2 class="text-xl font-semibold text-neutral-900">
          Похожие товары других производителей
        </h2>
        <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkmProductCard
            v-for="item in similarProducts"
            :key="item.slug"
            :title="item.title"
            :to="`/product/${item.slug}`"
            :manufacturer="getManufacturerLabel(item.manufacturerSlug)"
            :sku="item.sku"
            :badges="item.badges ? [...item.badges] : undefined"
          />
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

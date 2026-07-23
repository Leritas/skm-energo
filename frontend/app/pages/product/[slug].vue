<script setup lang="ts">
import { computed, ref } from 'vue'
import { SITE } from '~/constants/site'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const product = computed(() => ({
  title: 'Предохранитель NH00 160A',
  manufacturer: 'MERSEN',
  sku: 'NH00-160',
  description:
    'Низковольтный предохранитель серии NH00 для промышленных распределительных щитов. Поставка под заказ, datasheet в PDF.',
  specs: [
    { label: 'Номинальный ток', value: '160 A' },
    { label: 'Напряжение', value: '690 V AC' },
    { label: 'Серия', value: 'NH00' },
    { label: 'Производитель', value: 'MERSEN' },
  ],
  pdfHref: '/files/nh00-160a.pdf',
  images: [] as Array<{ src: string; alt?: string }>,
}))

useSeoMeta({
  title: `${product.value.title} — ${SITE.name}`,
  description: product.value.description,
})

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: product.value.manufacturer, to: '/catalog/mersen' },
  { label: product.value.title },
])

const activeTab = ref('desc')
const tabItems = [
  {
    label: 'Описание',
    value: 'desc',
    content: '',
  },
  {
    label: 'Характеристики',
    value: 'specs',
    content: '',
  },
  {
    label: 'PDF',
    value: 'pdf',
    content: '',
  },
]
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        :title="product.title"
        :description="`${product.manufacturer} · арт. ${product.sku}`"
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <p class="mb-6 text-xs text-neutral-400">
        Stub PDP · slug: {{ slug || '—' }}
      </p>

      <div class="grid gap-10 lg:grid-cols-2">
        <SkmProductGallery
          :images="product.images"
          :alt="product.title"
        />

        <div>
          <SkmBadge
            label="PDF"
            tone="neutral"
            size="sm"
            class="mb-4"
          />
          <p class="text-sm leading-relaxed text-neutral-600">
            {{ product.description }}
          </p>
          <div class="mt-6">
            <SkmButton
              variant="primary"
              to="/contacts"
            >
              Запросить поставку
            </SkmButton>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <SkmTabs
          v-model="activeTab"
          :items="tabItems"
        />
        <div class="mt-6">
          <p
            v-if="activeTab === 'desc'"
            class="text-sm leading-relaxed text-neutral-600"
          >
            {{ product.description }}
          </p>
          <SkmSpecList
            v-else-if="activeTab === 'specs'"
            :items="product.specs"
          />
          <div v-else-if="activeTab === 'pdf'">
            <SkmFileLink
              :href="product.pdfHref"
              filename="nh00-160a-datasheet.pdf"
              size-label="1.2 МБ"
            />
          </div>
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

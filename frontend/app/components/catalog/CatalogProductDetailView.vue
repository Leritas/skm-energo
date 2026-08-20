<script setup lang="ts">
import {
  productBadgeLabel,
  productBadgeTone,
  toProductCardBadges,
} from '~/components/ui/SkmProductCard/badgeDisplay';
import type {
  CatalogBreadcrumb,
  CatalogProductDetail,
  CatalogProductListItem,
} from '~/types/catalog';
import { formatAttachedFileSize } from '~/types/catalog';

const props = defineProps<{
  product: CatalogProductDetail;
  manufacturerLabel: string;
  breadcrumbs: CatalogBreadcrumb[];
  similarProducts?: CatalogProductListItem[];
  similarManufacturerLabel?: (slug: string) => string;
}>();

const activeTab = ref('desc');
const tabItems = [
  { label: 'Описание', value: 'desc', content: '' },
  { label: 'Характеристики', value: 'specs', content: '' },
  { label: 'Документы', value: 'pdf', content: '' },
];

const galleryImages = computed(() =>
  props.product.photos.map((photo) => ({
    src: photo.url,
    alt: photo.filename,
  })),
);
</script>

<template>
  <SkmPageHeader
    :title="product.title"
    :description="`${manufacturerLabel} · арт. ${product.sku}`"
  >
    <template #breadcrumbs>
      <SkmBreadcrumbs :items="breadcrumbs" />
    </template>
  </SkmPageHeader>

  <div class="grid gap-10 lg:grid-cols-2">
    <SkmProductGallery :images="galleryImages" :alt="product.title" />

    <div>
      <div v-if="product.badges?.length" class="mb-4 flex flex-wrap gap-2">
        <SkmBadge
          v-for="badge in toProductCardBadges(product.badges)"
          :key="badge"
          :label="productBadgeLabel(badge)"
          :tone="productBadgeTone(badge)"
          size="sm"
        />
      </div>
      <p class="text-sm leading-relaxed text-neutral-600">
        {{ product.description }}
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
        class="text-sm leading-relaxed text-neutral-600 whitespace-pre-line"
      >
        {{ product.description }}
      </p>
      <SkmSpecList
        v-else-if="activeTab === 'specs' && product.specs.length > 0"
        :items="product.specs"
      />
      <p v-else-if="activeTab === 'specs'" class="text-sm text-neutral-500">
        Характеристики пока не заполнены.
      </p>
      <div v-else-if="activeTab === 'pdf'" class="space-y-3">
        <SkmFileLink
          v-for="document in product.documents"
          :key="document.id"
          :href="document.url"
          :filename="document.filename"
          :size-label="formatAttachedFileSize(document.sizeBytes)"
        />
        <p
          v-if="product.documents.length === 0"
          class="text-sm text-neutral-500"
        >
          Документация будет добавлена менеджером при запросе поставки.
        </p>
      </div>
    </div>
  </div>

  <div v-if="similarProducts?.length" class="mt-16">
    <h2 class="text-xl font-semibold text-neutral-900">
      Похожие товары других производителей
    </h2>
    <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SkmProductCard
        v-for="item in similarProducts"
        :key="item.slug"
        :title="item.title"
        :to="`/product/${item.slug}`"
        :image-src="item.image?.url ?? null"
        :manufacturer="
          similarManufacturerLabel
            ? similarManufacturerLabel(item.manufacturerSlug)
            : item.manufacturerSlug
        "
        :sku="item.sku"
        :badges="toProductCardBadges(item.badges)"
      />
    </div>
  </div>
</template>

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

const hasPhotos = computed(() => props.product.photos.length > 0);
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

  <section class="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
    <div>
      <SkmProductGallery
        v-if="hasPhotos"
        :images="galleryImages"
        :alt="product.title"
      />
      <SkmProductMedia v-else :src="null" :alt="product.title" aspect="4/3" />
    </div>

    <div
      class="flex flex-col rounded-xl border border-neutral-100 bg-neutral-50/60 p-6 lg:p-8"
    >
      <div v-if="product.badges?.length" class="mb-4 flex flex-wrap gap-2">
        <SkmBadge
          v-for="badge in toProductCardBadges(product.badges)"
          :key="badge"
          :label="productBadgeLabel(badge)"
          :tone="productBadgeTone(badge)"
          size="sm"
        />
      </div>

      <p class="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
        {{ product.description }}
      </p>

      <div class="mt-6">
        <SkmButton variant="primary" to="/contacts">
          Запросить поставку
        </SkmButton>
      </div>
    </div>
  </section>

  <section class="mt-12">
    <SkmTabs v-model="activeTab" :items="tabItems" />

    <div class="mt-6">
      <p
        v-if="activeTab === 'desc'"
        class="whitespace-pre-line text-sm leading-relaxed text-neutral-600"
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

      <SkmCatalogDocumentList
        v-else-if="activeTab === 'pdf'"
        :documents="product.documents"
      />
    </div>
  </section>

  <section
    v-if="similarProducts?.length"
    class="mt-16"
    aria-labelledby="similar-products-heading"
  >
    <h2
      id="similar-products-heading"
      class="text-xl font-semibold text-neutral-900"
    >
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
  </section>
</template>

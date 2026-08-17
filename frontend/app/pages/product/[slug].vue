<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  productBadgeLabel,
  productBadgeTone,
  toProductCardBadges,
} from '~/components/ui/SkmProductCard/badgeDisplay';
import { getCategoryBreadcrumbs, getManufacturerLabel } from '~/utils/catalog';
import { SITE } from '~/constants/site';

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ''));

const { data: product, error: productError } = await useCatalogProduct(slug);
const { data: manufacturers } = await useCatalogManufacturers();
const { data: allCategories } = await useCatalogAllCategories();

if (productError.value) {
  throw createError({
    statusCode: productError.value.statusCode === 404 ? 404 : 500,
    statusMessage:
      productError.value.statusCode === 404
        ? 'Товар не найден'
        : 'Не удалось загрузить товар',
  });
}

const { data: similarProducts } = await useAsyncData(
  () =>
    `catalog-similar-${slug.value}-${product.value?.categorySlug ?? ''}-${product.value?.similarSlugs.join(',') ?? ''}`,
  () => {
    const item = product.value;
    if (!item) {
      return [];
    }
    return fetchSimilarProducts(item);
  },
  { watch: [() => product.value?.slug, () => product.value?.similarSlugs] },
);

function manufacturerLabel(manufacturerSlug: string) {
  return getManufacturerLabel(manufacturerSlug, manufacturers.value);
}

useSeoMeta({
  title: () => `${product.value!.title} — ${SITE.name}`,
  description: () => product.value!.description,
});

const breadcrumbs = computed(() => {
  const item = product.value!;
  return [
    ...getCategoryBreadcrumbs(
      item.categorySlug,
      null,
      allCategories.value ?? [],
    ),
    { label: item.title },
  ];
});

const activeTab = ref('desc');
const tabItems = [
  { label: 'Описание', value: 'desc', content: '' },
  { label: 'Характеристики', value: 'specs', content: '' },
  { label: 'PDF', value: 'pdf', content: '' },
];

const pdfFilename = computed(() => {
  const href = product.value?.pdfHref;
  if (!href) {
    return undefined;
  }
  return href.split('/').pop() ?? 'datasheet.pdf';
});
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        :title="product!.title"
        :description="`${manufacturerLabel(product!.manufacturerSlug)} · арт. ${product!.sku}`"
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div class="grid gap-10 lg:grid-cols-2">
        <SkmProductGallery :images="[]" :alt="product!.title" />

        <div>
          <div v-if="product!.badges?.length" class="mb-4 flex flex-wrap gap-2">
            <SkmBadge
              v-for="badge in toProductCardBadges(product!.badges)"
              :key="badge"
              :label="productBadgeLabel(badge)"
              :tone="productBadgeTone(badge)"
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
            :manufacturer="manufacturerLabel(item.manufacturerSlug)"
            :sku="item.sku"
            :badges="toProductCardBadges(item.badges)"
          />
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

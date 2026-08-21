<script setup lang="ts">
import {
  productBadgeLabel,
  productBadgeTone,
  toProductCardBadges,
} from '~/components/ui/SkmProductCard/badgeDisplay';
import type {
  CatalogCategory,
  CatalogManufacturer,
  CatalogProductListItem,
} from '~/types/catalog';
import { getCategoryLabel, getManufacturerLabel } from '~/utils/catalog';
import SkmCatalogSearchSkuCopy from './SkmCatalogSearchSkuCopy.vue';

const props = defineProps<{
  results: CatalogProductListItem[];
  query: string;
  categories: CatalogCategory[];
  manufacturers: CatalogManufacturer[];
}>();

const emit = defineEmits<{
  select: [];
}>();

function manufacturerLabel(slug: string) {
  return getManufacturerLabel(slug, props.manufacturers);
}

function categoryLabel(slug: string) {
  return getCategoryLabel(slug, props.categories);
}

async function goToProduct(slug: string) {
  emit('select');
  await navigateTo(`/product/${slug}`);
}
</script>

<template>
  <ul v-if="results.length" class="divide-y divide-neutral-100">
    <li v-for="product in results" :key="product.slug">
      <div
        class="group flex cursor-pointer items-center gap-3 border-l-2 border-neutral-200 py-3 pl-4 pr-4 transition hover:border-accent-500 hover:bg-neutral-50"
        role="link"
        tabindex="0"
        @click="goToProduct(product.slug)"
        @keydown.enter.prevent="goToProduct(product.slug)"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-neutral-900">
            {{ product.title }}
          </p>
          <p class="mt-1 text-xs">
            <span class="font-semibold text-accent-600">{{
              manufacturerLabel(product.manufacturerSlug)
            }}</span>
            <span class="mx-1.5 text-neutral-300">·</span>
            <span class="text-neutral-500">{{
              categoryLabel(product.categorySlug)
            }}</span>
          </p>
          <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <SkmCatalogSearchSkuCopy :sku="product.sku" />
            <div
              v-if="toProductCardBadges(product.badges).length"
              class="flex flex-wrap gap-1 pl-0.5"
            >
              <SkmBadge
                v-for="badge in toProductCardBadges(product.badges)"
                :key="badge"
                :label="productBadgeLabel(badge)"
                :tone="productBadgeTone(badge)"
                size="sm"
              />
            </div>
          </div>
        </div>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-4 shrink-0 text-neutral-300 transition group-hover:text-neutral-600"
        />
      </div>
    </li>
  </ul>
  <p
    v-else-if="query.trim()"
    class="px-4 py-8 text-center text-sm text-neutral-500"
  >
    Ничего не найдено по запросу «{{ query.trim() }}»
  </p>
</template>

<script setup lang="ts">
import {
  productBadgeLabel,
  productBadgeTone,
  toProductCardBadges,
} from '~/components/ui/SkmProductCard/badgeDisplay';
import type { PrototypeSearchProduct } from '../types';
import SpotlightRowShell from './SpotlightRowShell.vue';
import SpotlightSkuCopy from './SpotlightSkuCopy.vue';

defineProps<{
  results: PrototypeSearchProduct[];
  query: string;
}>();
</script>

<template>
  <SpotlightRowShell :results="results" :query="query">
    <template #meta="{ product }">
      <p class="mt-1 text-xs">
        <span class="font-semibold text-accent-600">{{
          product.manufacturer
        }}</span>
        <span class="mx-1.5 text-neutral-300">·</span>
        <span class="text-neutral-500">{{ product.categoryLabel }}</span>
      </p>
      <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <SpotlightSkuCopy :sku="product.sku" />
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
    </template>
  </SpotlightRowShell>
</template>

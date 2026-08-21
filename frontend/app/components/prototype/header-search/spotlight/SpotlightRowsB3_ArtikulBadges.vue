<script setup lang="ts">
import {
  productBadgeLabel,
  productBadgeTone,
  toProductCardBadges,
} from '~/components/ui/SkmProductCard/badgeDisplay';
import type { PrototypeSearchProduct } from '../types';
import SpotlightRowShell from './SpotlightRowShell.vue';

defineProps<{
  results: PrototypeSearchProduct[];
  query: string;
}>();
</script>

<template>
  <SpotlightRowShell :results="results" :query="query">
    <template #meta="{ product }">
      <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span class="text-xs font-semibold text-accent-600">
          {{ product.manufacturer }}
        </span>
        <span class="text-neutral-300">·</span>
        <span class="text-xs text-neutral-500">
          Арт.&nbsp;<span class="font-mono text-neutral-600">{{
            product.sku
          }}</span>
        </span>
        <template v-if="toProductCardBadges(product.badges).length">
          <span class="hidden text-neutral-300 sm:inline">·</span>
          <div class="flex flex-wrap gap-1">
            <SkmBadge
              v-for="badge in toProductCardBadges(product.badges)"
              :key="badge"
              :label="productBadgeLabel(badge)"
              :tone="productBadgeTone(badge)"
              size="sm"
            />
          </div>
        </template>
      </div>
    </template>
  </SpotlightRowShell>
</template>

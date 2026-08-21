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
      <div class="mt-1.5 flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-accent-600">
          {{ product.manufacturer }}
        </span>
        <SkmBadge
          v-for="badge in toProductCardBadges(product.badges)"
          :key="badge"
          :label="productBadgeLabel(badge)"
          :tone="productBadgeTone(badge)"
          size="sm"
        />
      </div>
    </template>
  </SpotlightRowShell>
</template>

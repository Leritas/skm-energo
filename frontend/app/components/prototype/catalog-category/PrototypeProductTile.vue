<script setup lang="ts">
import {
  productBadgeLabel,
  productBadgeTone,
  toProductCardBadges,
} from '~/components/ui/SkmProductCard/badgeDisplay';
import type { ProductBadge } from '~/types/catalog';

defineProps<{
  title: string;
  manufacturer: string;
  sku: string;
  badges: ProductBadge[];
  imageUrl: string | null;
  compact?: boolean;
}>();
</script>

<template>
  <div
    class="group overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
  >
    <div class="relative" :class="compact ? 'mx-4 mt-4' : ''">
      <SkmProductMedia
        :src="imageUrl"
        :alt="title"
        aspect="1/1"
        :class="compact ? 'rounded-lg' : 'rounded-none'"
      />
      <div
        v-if="badges.length"
        class="absolute left-2 top-2 flex flex-wrap gap-1"
      >
        <SkmBadge
          v-for="badge in toProductCardBadges(badges)"
          :key="badge"
          :label="productBadgeLabel(badge)"
          :tone="productBadgeTone(badge)"
          size="sm"
        />
      </div>
    </div>
    <div class="p-4">
      <p class="text-xs font-medium uppercase tracking-wide text-accent-600">
        {{ manufacturer }}
      </p>
      <h3
        class="mt-1 text-base font-semibold text-neutral-950 group-hover:text-accent-600"
      >
        {{ title }}
      </h3>
      <p class="mt-1 text-xs text-neutral-500">Артикул: {{ sku }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  productBadgeLabel,
  productBadgeTone,
  toProductCardBadges,
} from '~/components/ui/SkmProductCard/badgeDisplay';
import type { ProductBadge } from '~/types/catalog';

defineProps<{
  title: string;
  to: string;
  manufacturer: string;
  sku: string;
  badges?: ProductBadge[];
  imageSrc?: string | null;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="group overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
  >
    <div class="relative mx-4 mt-4">
      <SkmProductMedia
        :src="imageSrc"
        :alt="title"
        aspect="1/1"
        class="rounded-lg"
      />
      <div
        v-if="badges?.length"
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
  </NuxtLink>
</template>

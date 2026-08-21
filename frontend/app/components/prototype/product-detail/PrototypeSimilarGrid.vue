<script setup lang="ts">
import { toProductCardBadges } from '~/components/ui/SkmProductCard/badgeDisplay';
import type { PrototypeSimilarProduct } from './types';

defineProps<{
  items: PrototypeSimilarProduct[];
  heading?: string;
}>();
</script>

<template>
  <section v-if="items.length" class="mt-16">
    <h2 class="text-xl font-semibold text-neutral-900">
      {{ heading ?? 'Похожие товары других производителей' }}
    </h2>
    <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <SkmProductCard
        v-for="item in items"
        :key="item.slug"
        :title="item.title"
        to="#"
        :image-src="item.imageUrl"
        :manufacturer="item.manufacturer"
        :sku="item.sku"
        :badges="toProductCardBadges(item.badges)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  productBadgeLabel,
  productBadgeTone,
  toProductCardBadges,
} from '~/components/ui/SkmProductCard/badgeDisplay';
import type { PrototypeProductDetailData } from './types';

defineProps<{
  data: PrototypeProductDetailData;
}>();
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <SkmBadge
      v-for="badge in toProductCardBadges(data.badges)"
      :key="badge"
      :label="productBadgeLabel(badge)"
      :tone="productBadgeTone(badge)"
      size="sm"
    />
  </div>
</template>

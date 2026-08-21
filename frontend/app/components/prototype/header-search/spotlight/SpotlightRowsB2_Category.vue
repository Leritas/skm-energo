<script setup lang="ts">
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
      <p class="mt-1 text-xs">
        <span class="font-semibold text-accent-600">{{
          product.manufacturer
        }}</span>
        <span class="mx-1.5 text-neutral-300">·</span>
        <span class="text-neutral-500">{{ product.categoryLabel }}</span>
      </p>
    </template>
  </SpotlightRowShell>
</template>

<script setup lang="ts">
import type { PrototypeSearchProduct } from '../types';

defineProps<{
  results: PrototypeSearchProduct[];
  query: string;
}>();

function goToProduct(slug: string) {
  navigateTo(`/product/${slug}`);
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
          <slot name="meta" :product="product" />
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

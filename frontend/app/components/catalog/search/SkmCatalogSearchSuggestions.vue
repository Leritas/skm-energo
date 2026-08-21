<script setup lang="ts">
import { CATALOG_SEARCH_SUGGESTIONS } from '~/constants/catalog-search-suggestions';

defineProps<{
  onPick: (value: string) => void;
}>();
</script>

<template>
  <div class="px-3 py-2">
    <p
      class="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400"
    >
      Популярные запросы
    </p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="suggestion in CATALOG_SEARCH_SUGGESTIONS"
        :key="suggestion"
        type="button"
        class="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 transition hover:border-accent-300 hover:text-accent-700"
        @click="onPick(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

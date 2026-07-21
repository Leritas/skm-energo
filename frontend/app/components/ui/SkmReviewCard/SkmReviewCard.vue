<script setup lang="ts">
withDefaults(
  defineProps<{
    author: string
    dateLabel: string
    text: string
    rating?: number
  }>(),
  {
    rating: undefined,
  },
)
</script>

<template>
  <article class="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm font-semibold text-neutral-950">
        {{ author }}
      </p>
      <time class="text-xs text-neutral-500">
        {{ dateLabel }}
      </time>
    </div>
    <p
      v-if="rating != null"
      class="mt-2 text-xs font-medium text-accent-600"
      aria-label="Оценка"
    >
      {{ '★'.repeat(rating) }}{{ '☆'.repeat(Math.max(0, 5 - rating)) }}
    </p>
    <p class="mt-3 text-sm leading-relaxed text-neutral-600">
      {{ text }}
    </p>
  </article>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    to: string
    excerpt?: string
    dateLabel: string
    cover?: string | null
  }>(),
  {
    excerpt: undefined,
    cover: null,
  },
)
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
  >
    <div
      v-if="cover"
      class="aspect-[16/9] overflow-hidden bg-neutral-100"
    >
      <img
        :src="cover"
        :alt="title"
        class="size-full object-cover transition-transform group-hover:scale-[1.02]"
      >
    </div>
    <div class="flex flex-1 flex-col p-5">
      <time class="text-xs font-medium text-neutral-500">
        {{ dateLabel }}
      </time>
      <h3 class="mt-2 text-lg font-semibold text-neutral-950 group-hover:text-accent-600">
        {{ title }}
      </h3>
      <p
        v-if="excerpt"
        class="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600"
      >
        {{ excerpt }}
      </p>
      <span class="mt-auto pt-4 text-sm font-medium text-accent-600">
        Читать →
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string
    to: string
    logo?: string | null
    linesCount?: number
  }>(),
  {
    logo: null,
    linesCount: undefined,
  },
)
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
  >
    <div
      class="mb-4 flex h-16 items-center justify-center rounded-lg bg-neutral-50"
    >
      <img
        v-if="logo"
        :src="logo"
        :alt="name"
        class="max-h-12 max-w-full object-contain"
      >
      <span
        v-else
        class="text-sm font-semibold uppercase tracking-wide text-neutral-400"
      >
        {{ name.slice(0, 2) }}
      </span>
    </div>
    <h3 class="text-lg font-semibold text-neutral-950 group-hover:text-accent-600">
      {{ name }}
    </h3>
    <p
      v-if="linesCount != null"
      class="mt-1 text-sm text-neutral-500"
    >
      {{ linesCount }} {{ linesCount === 1 ? 'линейка' : 'линеек' }}
    </p>
  </NuxtLink>
</template>

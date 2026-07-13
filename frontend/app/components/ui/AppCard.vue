<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  to?: string
}>()
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    class="block rounded-xl border border-neutral-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    :class="{ 'hover:border-neutral-200': !!to }"
  >
    <h3 v-if="title" class="text-lg font-semibold text-neutral-950">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="mt-2 text-sm leading-relaxed text-neutral-600"
    >
      {{ description }}
    </p>
    <slot />
  </component>
</template>

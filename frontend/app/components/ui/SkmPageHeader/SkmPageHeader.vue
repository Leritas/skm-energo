<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: undefined,
  },
)
</script>

<template>
  <header class="mb-8">
    <div v-if="$slots.breadcrumbs" class="mb-4">
      <slot name="breadcrumbs" />
    </div>
    <h1 class="text-3xl font-bold text-neutral-900 md:text-4xl">
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="mt-4 max-w-2xl text-neutral-600"
    >
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </header>
</template>

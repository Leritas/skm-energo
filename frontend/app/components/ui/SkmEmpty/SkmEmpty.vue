<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: string
  }>(),
  {
    description: undefined,
    icon: 'i-lucide-inbox',
  },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div
      class="mb-4 flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"
    >
      <UIcon :name="icon" class="size-7" />
    </div>
    <h3 class="text-lg font-semibold text-neutral-950">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="mt-2 max-w-md text-sm leading-relaxed text-neutral-600"
    >
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-6">
      <slot name="actions" />
    </div>
  </div>
</template>

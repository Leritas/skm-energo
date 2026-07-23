<script setup lang="ts">
withDefaults(
  defineProps<{
    href: string
    label?: string
    filename?: string
    sizeLabel?: string
  }>(),
  {
    label: undefined,
    filename: undefined,
    sizeLabel: undefined,
  },
)
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-2 text-sm font-medium text-neutral-800 transition-colors hover:text-accent-600"
  >
    <UIcon name="i-lucide-file-text" class="size-4 shrink-0 text-accent-500" />
    <span>{{ label ?? filename ?? 'Скачать файл' }}</span>
    <span
      v-if="sizeLabel"
      class="text-xs font-normal text-neutral-500"
    >
      ({{ sizeLabel }})
    </span>
  </a>
</template>

<script setup lang="ts">
import type { AttachedFile } from '@skm/specs';
import { formatAttachedFileSize } from '~/types/catalog';

defineProps<{
  documents: AttachedFile[];
}>();
</script>

<template>
  <div
    v-if="documents.length"
    class="divide-y divide-neutral-100 rounded-xl border border-neutral-100"
  >
    <a
      v-for="document in documents"
      :key="document.id"
      :href="document.url"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-4 p-4 transition hover:bg-neutral-50"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600"
      >
        <UIcon name="i-lucide-file-text" class="size-4" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium text-neutral-950">
          {{ document.filename }}
        </span>
        <span class="text-xs text-neutral-500">
          {{ formatAttachedFileSize(document.sizeBytes) }}
        </span>
      </span>
      <UIcon name="i-lucide-download" class="size-4 shrink-0 text-accent-600" />
    </a>
  </div>
  <p v-else class="text-sm text-neutral-500">
    Документация будет добавлена менеджером при запросе поставки.
  </p>
</template>

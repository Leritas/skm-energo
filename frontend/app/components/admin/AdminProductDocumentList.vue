<script setup lang="ts">
import type { AttachedFile } from '@skm/specs';
import { formatAttachedFileSize } from '~/types/catalog';

const MAX_DOCUMENTS = 15;

defineProps<{
  documents: AttachedFile[];
}>();

const emit = defineEmits<{
  upload: [file: File];
  delete: [documentId: number];
  move: [index: number, direction: -1 | 1];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

function triggerUpload() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (file) {
    emit('upload', file);
  }
}
</script>

<template>
  <section class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 class="font-semibold text-neutral-950">Документы</h3>
        <p class="text-xs text-neutral-500">
          {{ documents.length }} / {{ MAX_DOCUMENTS }}
        </p>
      </div>
      <SkmButton
        size="sm"
        icon="i-lucide-file-up"
        :disabled="documents.length >= MAX_DOCUMENTS"
        @click="triggerUpload"
      >
        Загрузить
      </SkmButton>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="application/pdf,.doc,.docx,.xlsx"
      class="hidden"
      @change="handleFileChange"
    />
    <ul v-if="documents.length" class="mt-4 space-y-2">
      <li
        v-for="(doc, index) in documents"
        :key="doc.id"
        class="flex items-center gap-2 rounded-lg border border-neutral-100 px-3 py-2"
      >
        <button
          type="button"
          class="cursor-grab text-neutral-400"
          title="Ручка"
          aria-hidden="true"
        >
          ⠿
        </button>
        <span class="min-w-0 flex-1 truncate text-sm">{{ doc.filename }}</span>
        <span class="text-xs text-neutral-400">{{
          formatAttachedFileSize(doc.sizeBytes)
        }}</span>
        <button
          type="button"
          class="text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-40"
          aria-label="Выше"
          :disabled="index === 0"
          @click="emit('move', index, -1)"
        >
          ↑
        </button>
        <button
          type="button"
          class="text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-40"
          aria-label="Ниже"
          :disabled="index === documents.length - 1"
          @click="emit('move', index, 1)"
        >
          ↓
        </button>
        <button
          type="button"
          class="text-xs text-red-600 hover:text-red-700"
          aria-label="Удалить документ"
          @click="emit('delete', doc.id)"
        >
          ✕
        </button>
      </li>
    </ul>
    <div
      v-else
      class="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-8"
    >
      <p class="text-sm text-neutral-500">Документы пока не загружены</p>
      <SkmButton size="sm" class="mt-3" @click="triggerUpload">
        Загрузить
      </SkmButton>
    </div>
  </section>
</template>

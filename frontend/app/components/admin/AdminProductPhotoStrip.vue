<script setup lang="ts">
import type { AttachedFile } from '@skm/specs';

const MAX_PHOTOS = 15;

const props = defineProps<{
  photos: AttachedFile[];
}>();

const emit = defineEmits<{
  upload: [file: File];
  delete: [photoId: number];
  move: [index: number, direction: -1 | 1];
  makeFirst: [photoId: number];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const atLimit = computed(() => props.photos.length >= MAX_PHOTOS);

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
        <h3 class="font-semibold text-neutral-950">Фото</h3>
        <p class="text-xs text-neutral-500">
          {{ photos.length }} / {{ MAX_PHOTOS }} · порядок = карточка + PDP
        </p>
      </div>
      <SkmButton
        size="sm"
        icon="i-lucide-upload"
        :disabled="atLimit"
        @click="triggerUpload"
      >
        Загрузить
      </SkmButton>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleFileChange"
    />
    <div v-if="photos.length" class="mt-4 flex gap-3 overflow-x-auto pb-2">
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="relative w-28 shrink-0"
      >
        <div
          class="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
        >
          <img
            :src="photo.url"
            :alt="photo.filename"
            class="aspect-square w-full object-cover"
          />
          <SkmBadge
            v-if="index === 0"
            tone="accent"
            class="absolute left-1 top-1 text-[10px]"
          >
            обложка
          </SkmBadge>
          <button
            type="button"
            class="absolute right-1 top-1 rounded border border-transparent bg-white/90 px-1 py-0.5 text-xs leading-none text-red-600 hover:border-neutral-200 hover:bg-white"
            aria-label="Удалить фото"
            @click="emit('delete', photo.id)"
          >
            ✕
          </button>
        </div>
        <div class="mt-2 flex items-center justify-center gap-1">
          <button
            type="button"
            class="cursor-grab rounded border border-neutral-200 px-1.5 py-0.5 text-xs text-neutral-500"
            title="Ручка перетаскивания"
            aria-hidden="true"
          >
            ⠿
          </button>
          <button
            type="button"
            class="rounded border border-neutral-200 px-1.5 py-0.5 text-xs disabled:opacity-40"
            aria-label="Сдвинуть влево"
            :disabled="index === 0"
            @click="emit('move', index, -1)"
          >
            ←
          </button>
          <button
            type="button"
            class="rounded border border-neutral-200 px-1.5 py-0.5 text-xs disabled:opacity-40"
            aria-label="Сдвинуть вправо"
            :disabled="index === photos.length - 1"
            @click="emit('move', index, 1)"
          >
            →
          </button>
        </div>
        <div v-if="index !== 0" class="mt-1 text-center">
          <button
            type="button"
            class="text-[10px] text-accent-600 hover:underline"
            @click="emit('makeFirst', photo.id)"
          >
            на обложку
          </button>
        </div>
      </div>
    </div>
    <div
      v-else
      class="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-8"
    >
      <p class="text-sm text-neutral-500">Фото пока не загружены</p>
      <SkmButton size="sm" class="mt-3" @click="triggerUpload">
        Загрузить
      </SkmButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AttachedFile } from '@skm/specs';

defineProps<{
  coverPhoto: AttachedFile | null;
}>();

const emit = defineEmits<{
  replace: [file: File];
  delete: [];
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
    emit('replace', file);
  }
}
</script>

<template>
  <section class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
    <h3 class="font-semibold text-neutral-950">Обложка</h3>
    <p class="mt-1 text-xs text-neutral-500">
      Один слот · замена удаляет предыдущий файл сразу
    </p>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleFileChange"
    />
    <div v-if="coverPhoto" class="mt-4 flex items-start gap-4">
      <img
        :src="coverPhoto.url"
        :alt="coverPhoto.filename"
        class="h-32 w-48 rounded-lg border border-neutral-200 object-cover"
      />
      <div class="space-y-2">
        <p class="text-sm">{{ coverPhoto.filename }}</p>
        <SkmButton size="sm" @click="triggerUpload">Заменить</SkmButton>
        <SkmButton size="sm" variant="outline" @click="emit('delete')">
          Удалить
        </SkmButton>
      </div>
    </div>
    <div
      v-else
      class="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-10"
    >
      <p class="text-sm text-neutral-500">Нет обложки</p>
      <SkmButton size="sm" class="mt-3" @click="triggerUpload">
        Загрузить
      </SkmButton>
    </div>
  </section>
</template>

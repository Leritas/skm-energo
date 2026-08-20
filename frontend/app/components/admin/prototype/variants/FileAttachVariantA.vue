<script setup lang="ts">
import type { FileAttachPrototype } from '../file-attach-mock';
import { formatFileSize } from '../file-attach-mock';

defineProps<{
  proto: FileAttachPrototype;
}>();
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap gap-2">
      <SkmButton
        size="sm"
        :variant="proto.entity.value === 'product' ? 'primary' : 'outline'"
        @click="proto.setEntity('product')"
      >
        Товар
      </SkmButton>
      <SkmButton
        size="sm"
        :variant="proto.entity.value === 'news' ? 'primary' : 'outline'"
        @click="proto.setEntity('news')"
      >
        Новость
      </SkmButton>
      <SkmButton
        size="sm"
        :variant="proto.entity.value === 'category' ? 'primary' : 'outline'"
        @click="proto.setEntity('category')"
      >
        Категория
      </SkmButton>
    </div>

    <div
      v-if="proto.entity.value === 'product'"
      class="grid gap-6 lg:grid-cols-2"
    >
      <div class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p
          class="text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Поля формы (stub)
        </p>
        <div class="mt-4 space-y-3">
          <SkmInput model-value="Предохранитель NH00 160A" disabled />
          <SkmInput model-value="NH00-160" disabled />
          <SkmTextarea
            model-value="Описание товара сохраняется отдельной кнопкой «Сохранить»."
            :rows="4"
            disabled
          />
        </div>
      </div>

      <div class="space-y-4">
        <section
          class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="font-semibold text-neutral-950">Photos</h3>
              <p class="text-xs text-neutral-500">
                {{ proto.photos.value.length }} / 15 · порядок = карточка + PDP
              </p>
            </div>
            <SkmButton
              size="sm"
              icon="i-lucide-upload"
              @click="proto.uploadPhoto()"
            >
              Загрузить
            </SkmButton>
          </div>
          <div class="mt-4 flex gap-3 overflow-x-auto pb-2">
            <div
              v-for="(photo, index) in proto.photos.value"
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
                  @click="proto.removePhoto(photo.id)"
                >
                  ✕
                </button>
              </div>
              <div class="mt-2 flex items-center justify-center gap-1">
                <button
                  type="button"
                  class="cursor-grab rounded border border-neutral-200 px-1.5 py-0.5 text-xs text-neutral-500"
                  title="Ручка перетаскивания"
                >
                  ⠿
                </button>
                <button
                  type="button"
                  class="rounded border border-neutral-200 px-1.5 py-0.5 text-xs disabled:opacity-40"
                  aria-label="Сдвинуть влево"
                  :disabled="index === 0"
                  @click="proto.movePhoto(photo.id, -1)"
                >
                  ←
                </button>
                <button
                  type="button"
                  class="rounded border border-neutral-200 px-1.5 py-0.5 text-xs disabled:opacity-40"
                  aria-label="Сдвинуть вправо"
                  :disabled="index === proto.photos.value.length - 1"
                  @click="proto.movePhoto(photo.id, 1)"
                >
                  →
                </button>
              </div>
              <div v-if="index !== 0" class="mt-1 text-center">
                <button
                  type="button"
                  class="text-[10px] text-accent-600 hover:underline"
                  @click="proto.makePhotoFirst(photo.id)"
                >
                  на обложку
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="font-semibold text-neutral-950">Documents</h3>
              <p class="text-xs text-neutral-500">
                {{ proto.documents.value.length }} / 15
              </p>
            </div>
            <SkmButton
              size="sm"
              icon="i-lucide-file-up"
              @click="proto.uploadDocument()"
            >
              Загрузить
            </SkmButton>
          </div>
          <ul class="mt-4 space-y-2">
            <li
              v-for="doc in proto.documents.value"
              :key="doc.id"
              class="flex items-center gap-2 rounded-lg border border-neutral-100 px-3 py-2"
            >
              <button
                type="button"
                class="cursor-grab text-neutral-400"
                title="Ручка"
              >
                ⠿
              </button>
              <span class="min-w-0 flex-1 truncate text-sm">{{
                doc.filename
              }}</span>
              <span class="text-xs text-neutral-400">{{
                formatFileSize(doc.sizeBytes)
              }}</span>
              <button
                type="button"
                class="text-xs text-neutral-500 hover:text-neutral-800"
                aria-label="Выше"
                @click="proto.moveDocument(doc.id, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="text-xs text-neutral-500 hover:text-neutral-800"
                aria-label="Ниже"
                @click="proto.moveDocument(doc.id, 1)"
              >
                ↓
              </button>
              <button
                type="button"
                class="text-xs text-red-600 hover:text-red-700"
                aria-label="Удалить документ"
                @click="proto.removeDocument(doc.id)"
              >
                ✕
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div
      v-else
      class="max-w-xl rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <h3 class="font-semibold text-neutral-950">coverPhoto</h3>
      <p class="mt-1 text-xs text-neutral-500">
        Один слот · replace удаляет предыдущий файл сразу
      </p>
      <div v-if="proto.coverPhoto.value" class="mt-4 flex items-start gap-4">
        <img
          :src="proto.coverPhoto.value.url"
          :alt="proto.coverPhoto.value.filename"
          class="h-32 w-48 rounded-lg border border-neutral-200 object-cover"
        />
        <div class="space-y-2">
          <p class="text-sm">{{ proto.coverPhoto.value.filename }}</p>
          <SkmButton size="sm" @click="proto.replaceCover()"
            >Заменить</SkmButton
          >
          <SkmButton size="sm" variant="outline" @click="proto.removeCover()">
            Удалить
          </SkmButton>
        </div>
      </div>
      <div
        v-else
        class="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-10"
      >
        <p class="text-sm text-neutral-500">Нет coverPhoto</p>
        <SkmButton size="sm" class="mt-3" @click="proto.replaceCover()"
          >Загрузить</SkmButton
        >
      </div>
    </div>
  </div>
</template>

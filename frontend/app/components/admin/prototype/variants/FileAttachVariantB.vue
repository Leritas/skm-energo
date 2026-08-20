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

    <div class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Основная форма (stub)
      </p>
      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <SkmInput model-value="Предохранитель NH00 160A" disabled />
        <SkmInput model-value="NH00-160" disabled />
      </div>
    </div>

    <template v-if="proto.entity.value === 'product'">
      <section class="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div
          class="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4"
        >
          <div>
            <h3 class="font-semibold text-neutral-950">Галерея Photos</h3>
            <p class="text-xs text-neutral-500">
              Горизонтальная лента · drag за ⠿
            </p>
          </div>
          <SkmButton size="sm" @click="proto.uploadPhoto()">+ Photo</SkmButton>
        </div>
        <div class="flex gap-0 divide-x divide-neutral-100 overflow-x-auto p-2">
          <div
            v-for="(photo, index) in proto.photos.value"
            :key="photo.id"
            class="min-w-[160px] shrink-0 p-3"
          >
            <div class="relative">
              <img
                :src="photo.url"
                :alt="photo.filename"
                class="aspect-[4/3] w-full rounded-md object-cover"
              />
              <SkmBadge
                v-if="index === 0"
                tone="accent"
                class="absolute left-2 top-2 text-[10px]"
              >
                на карточке
              </SkmBadge>
            </div>
            <p class="mt-2 truncate text-xs text-neutral-600">
              {{ photo.filename }}
            </p>
            <div class="mt-2 flex flex-wrap items-center gap-1">
              <button
                type="button"
                class="cursor-grab rounded bg-neutral-100 px-2 py-1 text-xs"
              >
                ⠿ drag
              </button>
              <button
                type="button"
                class="text-xs"
                @click="proto.movePhoto(photo.id, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="text-xs"
                @click="proto.movePhoto(photo.id, 1)"
              >
                ↓
              </button>
              <button
                v-if="index !== 0"
                type="button"
                class="text-[10px] text-accent-600"
                @click="proto.makePhotoFirst(photo.id)"
              >
                1-й
              </button>
              <button
                type="button"
                class="text-[10px] text-red-600"
                @click="proto.removePhoto(photo.id)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        class="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
      >
        <div
          class="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4"
        >
          <h3 class="font-semibold text-neutral-950">Documents</h3>
          <SkmButton
            size="sm"
            variant="outline"
            @click="proto.uploadDocument()"
          >
            + Document
          </SkmButton>
        </div>
        <table class="w-full text-left text-sm">
          <thead class="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th class="px-3 py-2 w-8" />
              <th class="px-3 py-2">Имя файла</th>
              <th class="px-3 py-2 w-24">Размер</th>
              <th class="px-3 py-2 w-32">Порядок</th>
              <th class="px-3 py-2 w-12" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="doc in proto.documents.value"
              :key="doc.id"
              class="border-t border-neutral-100"
            >
              <td class="px-3 py-2 text-neutral-400 cursor-grab">⠿</td>
              <td class="px-3 py-2">{{ doc.filename }}</td>
              <td class="px-3 py-2 text-neutral-500">
                {{ formatFileSize(doc.sizeBytes) }}
              </td>
              <td class="px-3 py-2">
                <button
                  type="button"
                  class="mr-1"
                  @click="proto.moveDocument(doc.id, -1)"
                >
                  ↑
                </button>
                <button type="button" @click="proto.moveDocument(doc.id, 1)">
                  ↓
                </button>
              </td>
              <td class="px-3 py-2">
                <button
                  type="button"
                  class="text-red-600"
                  @click="proto.removeDocument(doc.id)"
                >
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <section
      v-else
      class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <h3 class="font-semibold text-neutral-950">coverPhoto</h3>
      <div
        v-if="proto.coverPhoto.value"
        class="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]"
      >
        <img
          :src="proto.coverPhoto.value.url"
          class="aspect-video w-full rounded-lg object-cover"
          alt=""
        />
        <div class="flex flex-col justify-center gap-2">
          <p class="text-sm font-medium">
            {{ proto.coverPhoto.value.filename }}
          </p>
          <p class="text-xs text-neutral-500">
            {{ formatFileSize(proto.coverPhoto.value.sizeBytes) }} ·
            {{ proto.coverPhoto.value.mimeType }}
          </p>
          <div class="flex gap-2">
            <SkmButton size="sm" @click="proto.replaceCover()"
              >Заменить файл</SkmButton
            >
            <SkmButton size="sm" variant="ghost" @click="proto.removeCover()"
              >Удалить</SkmButton
            >
          </div>
        </div>
      </div>
      <div
        v-else
        class="mt-4 rounded-lg border border-dashed px-6 py-12 text-center text-sm text-neutral-500"
      >
        Пустой слот coverPhoto
        <div class="mt-3">
          <SkmButton size="sm" @click="proto.replaceCover()"
            >Загрузить coverPhoto</SkmButton
          >
        </div>
      </div>
    </section>
  </div>
</template>

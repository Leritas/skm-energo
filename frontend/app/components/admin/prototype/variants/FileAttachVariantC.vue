<script setup lang="ts">
import type { FileAttachPrototype } from '../file-attach-mock';
import { formatFileSize } from '../file-attach-mock';

defineProps<{
  proto: FileAttachPrototype;
}>();
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
    <div class="space-y-4">
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
        <SkmPageHeader
          title="Редактирование сущности"
          description="Поля сохраняются кнопкой «Сохранить» — файлы ниже живут отдельно."
        />
        <div class="mt-4 space-y-3">
          <SkmFormField label="Название">
            <SkmInput model-value="Предохранитель NH00 160A" disabled />
          </SkmFormField>
          <SkmFormField label="Артикул">
            <SkmInput model-value="NH00-160" disabled />
          </SkmFormField>
        </div>
        <p class="mt-6 text-xs text-neutral-400">
          Файловые операции → в правой панели (persist сразу).
        </p>
      </div>
    </div>

    <aside
      class="xl:sticky xl:top-4 xl:self-start rounded-xl border border-accent-200 bg-accent-50/40 p-4 shadow-sm"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-accent-700">
        Файлы · persist сразу
      </p>

      <template v-if="proto.entity.value === 'product'">
        <div class="mt-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold">Photos</h4>
            <SkmButton size="sm" @click="proto.uploadPhoto()">+</SkmButton>
          </div>
          <ul class="mt-3 space-y-3">
            <li
              v-for="(photo, index) in proto.photos.value"
              :key="photo.id"
              class="rounded-lg border border-white bg-white p-2 shadow-sm"
            >
              <div class="flex gap-2">
                <button
                  type="button"
                  class="cursor-grab self-start text-neutral-400"
                >
                  ⠿
                </button>
                <img
                  :src="photo.url"
                  :alt="photo.filename"
                  class="h-14 w-14 shrink-0 rounded object-cover"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1">
                    <SkmBadge
                      v-if="index === 0"
                      tone="accent"
                      class="text-[10px]"
                    >
                      на карточке
                    </SkmBadge>
                    <span class="truncate text-xs">{{ photo.filename }}</span>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <button
                      type="button"
                      class="text-[10px]"
                      @click="proto.movePhoto(photo.id, -1)"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      class="text-[10px]"
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
            </li>
          </ul>
        </div>

        <div class="mt-6 border-t border-accent-200 pt-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold">Documents</h4>
            <SkmButton
              size="sm"
              variant="outline"
              @click="proto.uploadDocument()"
              >+</SkmButton
            >
          </div>
          <ul class="mt-3 space-y-2">
            <li
              v-for="doc in proto.documents.value"
              :key="doc.id"
              class="rounded-lg border border-white bg-white px-2 py-2 text-xs"
            >
              <div class="flex items-start gap-2">
                <button type="button" class="cursor-grab text-neutral-400">
                  ⠿
                </button>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium">{{ doc.filename }}</p>
                  <p class="text-neutral-400">
                    {{ formatFileSize(doc.sizeBytes) }}
                  </p>
                </div>
                <div class="flex shrink-0 flex-col gap-1">
                  <button type="button" @click="proto.moveDocument(doc.id, -1)">
                    ↑
                  </button>
                  <button type="button" @click="proto.moveDocument(doc.id, 1)">
                    ↓
                  </button>
                  <button
                    type="button"
                    class="text-red-600"
                    @click="proto.removeDocument(doc.id)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </template>

      <template v-else>
        <div class="mt-4">
          <h4 class="text-sm font-semibold">coverPhoto</h4>
          <div v-if="proto.coverPhoto.value" class="mt-3 space-y-3">
            <img
              :src="proto.coverPhoto.value.url"
              class="w-full rounded-lg border border-white object-cover"
              alt=""
            />
            <p class="truncate text-xs">
              {{ proto.coverPhoto.value.filename }}
            </p>
            <SkmButton class="w-full" size="sm" @click="proto.replaceCover()"
              >Заменить</SkmButton
            >
            <SkmButton
              class="w-full"
              size="sm"
              variant="outline"
              @click="proto.removeCover()"
            >
              Удалить
            </SkmButton>
          </div>
          <div
            v-else
            class="mt-3 rounded-lg border border-dashed border-accent-300 py-8 text-center"
          >
            <SkmButton size="sm" @click="proto.replaceCover()"
              >Загрузить coverPhoto</SkmButton
            >
          </div>
        </div>
      </template>
    </aside>
  </div>
</template>

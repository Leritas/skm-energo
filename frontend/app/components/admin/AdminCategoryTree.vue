<script setup lang="ts">
import type { AdminCategoryDto } from '@skm/specs';
import type { AdminCategoryTreeRow } from '~/utils/admin-category-tree';

const props = defineProps<{
  rows: AdminCategoryTreeRow[];
  expandedIds: Set<number>;
  canManage: boolean;
  loading: boolean;
  emptyTitle: string;
  emptyDescription: string;
}>();

const emit = defineEmits<{
  toggle: [category: AdminCategoryDto];
  edit: [category: AdminCategoryDto];
  createChild: [category: AdminCategoryDto];
  togglePublished: [category: AdminCategoryDto];
  archive: [category: AdminCategoryDto];
  restore: [category: AdminCategoryDto];
}>();

function isExpanded(categoryId: number) {
  return props.expandedIds.has(categoryId);
}

function folderIcon(row: AdminCategoryTreeRow) {
  if (!row.hasChildren) {
    return 'i-lucide-tag';
  }
  return isExpanded(row.category.id)
    ? 'i-lucide-folder-open'
    : 'i-lucide-folder';
}

function canArchive(category: AdminCategoryDto) {
  return category.childCount === 0 && category.productCount === 0;
}

function countLabel(category: AdminCategoryDto) {
  const children =
    category.childCount > 0 ? `${category.childCount} подкат.` : 'без вложений';
  return `${children} · ${category.productCount} тов.`;
}

function onNameClick(row: AdminCategoryTreeRow) {
  if (row.hasChildren) {
    emit('toggle', row.category);
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-neutral-200 bg-white">
    <div v-if="loading" class="px-4 py-10 text-center text-sm text-neutral-500">
      Загрузка дерева…
    </div>

    <SkmEmpty
      v-else-if="rows.length === 0"
      :title="emptyTitle"
      :description="emptyDescription"
      icon="i-lucide-folder-tree"
    />

    <ul v-else role="tree" class="divide-y divide-neutral-100">
      <li
        v-for="row in rows"
        :key="row.category.id"
        role="treeitem"
        :aria-expanded="
          row.hasChildren ? isExpanded(row.category.id) : undefined
        "
        :aria-level="row.depth + 1"
      >
        <div
          class="group flex items-center gap-2 py-2.5 pr-3 transition-colors"
          :class="
            row.category.deletedAt ? 'bg-neutral-50/80' : 'hover:bg-neutral-50'
          "
          :style="{ paddingLeft: `${12 + row.depth * 28}px` }"
        >
          <button
            v-if="row.hasChildren"
            type="button"
            class="flex size-7 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-200/70 hover:text-neutral-800"
            :aria-label="
              isExpanded(row.category.id) ? 'Свернуть' : 'Развернуть'
            "
            @click="emit('toggle', row.category)"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 transition-transform"
              :class="isExpanded(row.category.id) ? 'rotate-90' : undefined"
            />
          </button>
          <span v-else class="size-7 shrink-0" />

          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg"
            :class="
              row.category.deletedAt
                ? 'bg-neutral-200 text-neutral-500'
                : row.category.isPublished
                  ? 'bg-accent-50 text-accent-700'
                  : 'bg-neutral-100 text-neutral-500'
            "
          >
            <UIcon :name="folderIcon(row)" class="size-4" />
          </span>

          <div class="min-w-0 flex-1">
            <p
              class="truncate text-sm font-medium"
              :class="[
                row.category.deletedAt
                  ? 'text-neutral-500'
                  : 'text-neutral-900',
                row.hasChildren ? 'cursor-pointer' : undefined,
              ]"
              @click="onNameClick(row)"
            >
              {{ row.category.name }}
            </p>
            <p class="truncate font-mono text-xs text-neutral-500">
              {{ row.category.slug }}
            </p>
          </div>

          <div class="hidden shrink-0 flex-wrap justify-end gap-1 sm:flex">
            <SkmBadge
              v-if="row.category.deletedAt"
              label="В архиве"
              tone="neutral"
              size="sm"
            />
            <SkmBadge
              v-else-if="row.category.isPublished"
              label="Опубликована"
              tone="accent"
              size="sm"
            />
            <SkmBadge v-else label="Черновик" tone="neutral" size="sm" />
          </div>

          <p
            class="hidden w-36 shrink-0 text-right text-xs text-neutral-500 lg:block"
          >
            {{ countLabel(row.category) }}
          </p>

          <div v-if="canManage" class="flex shrink-0 justify-end gap-0.5">
            <template v-if="row.category.deletedAt">
              <SkmButton
                variant="ghost"
                size="sm"
                icon="i-lucide-undo-2"
                aria-label="Восстановить"
                title="Восстановить"
                @click="emit('restore', row.category)"
              />
            </template>
            <template v-else>
              <SkmButton
                variant="ghost"
                size="sm"
                icon="i-lucide-pencil"
                aria-label="Изменить"
                title="Изменить"
                @click="emit('edit', row.category)"
              />
              <SkmButton
                variant="ghost"
                size="sm"
                icon="i-lucide-folder-plus"
                aria-label="Добавить дочернюю"
                title="Добавить дочернюю"
                @click="emit('createChild', row.category)"
              />
              <SkmButton
                variant="ghost"
                size="sm"
                :icon="
                  row.category.isPublished ? 'i-lucide-eye-off' : 'i-lucide-eye'
                "
                :aria-label="
                  row.category.isPublished
                    ? 'Снять с публикации'
                    : 'Опубликовать'
                "
                :title="
                  row.category.isPublished
                    ? 'Снять с публикации'
                    : 'Опубликовать'
                "
                @click="emit('togglePublished', row.category)"
              />
              <SkmButton
                variant="ghost"
                size="sm"
                icon="i-lucide-archive"
                aria-label="В архив"
                title="В архив"
                :disabled="!canArchive(row.category)"
                @click="emit('archive', row.category)"
              />
            </template>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { CatalogCategory } from '~/types/catalog';
import {
  flattenCatalogCategoryTree,
  type CatalogCategoryTreeRow,
} from '~/utils/catalog-category-tree';

const props = defineProps<{
  categories: CatalogCategory[];
  buildUrl: (slug: string) => string;
}>();

const emit = defineEmits<{
  navigate: [];
}>();

const expandedSlugs = defineModel<Set<string>>('expandedSlugs', {
  default: () => new Set<string>(),
});

const rows = computed(() =>
  flattenCatalogCategoryTree(props.categories, expandedSlugs.value),
);

function isExpanded(slug: string) {
  return expandedSlugs.value.has(slug);
}

function toggleExpanded(slug: string) {
  const next = new Set(expandedSlugs.value);
  if (next.has(slug)) {
    next.delete(slug);
  } else {
    next.add(slug);
  }
  expandedSlugs.value = next;
}

function folderIcon(row: CatalogCategoryTreeRow) {
  if (!row.hasChildren) {
    return 'i-lucide-box';
  }
  return isExpanded(row.category.slug)
    ? 'i-lucide-folder-tree'
    : 'i-lucide-folder';
}
</script>

<template>
  <ul role="tree" class="divide-y divide-neutral-100">
    <li
      v-for="row in rows"
      :key="`${row.depth}-${row.category.slug}`"
      role="treeitem"
      :aria-expanded="
        row.hasChildren ? isExpanded(row.category.slug) : undefined
      "
      :aria-level="row.depth + 1"
    >
      <div
        class="group flex items-center gap-1 py-1.5 pr-2 transition-colors hover:bg-brand-purple-50/60"
        :style="{ paddingLeft: `${8 + row.depth * 20}px` }"
      >
        <button
          v-if="row.hasChildren"
          type="button"
          class="flex size-6 shrink-0 items-center justify-center rounded text-brand-purple-400 transition hover:bg-brand-purple-100/80"
          :aria-label="
            isExpanded(row.category.slug) ? 'Свернуть' : 'Развернуть'
          "
          @click="toggleExpanded(row.category.slug)"
        >
          <UIcon
            name="i-lucide-chevron-right"
            class="size-3.5 transition-transform"
            :class="isExpanded(row.category.slug) ? 'rotate-90' : undefined"
          />
        </button>
        <span v-else class="size-6 shrink-0" />

        <span
          class="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-purple-100 text-brand-purple-700"
        >
          <UIcon :name="folderIcon(row)" class="size-3" />
        </span>

        <NuxtLink
          :to="buildUrl(row.category.slug)"
          class="min-w-0 flex-1 truncate text-sm text-neutral-900 transition hover:text-brand-purple-700"
          :class="row.depth === 0 ? 'font-semibold' : 'font-normal'"
          @click="emit('navigate')"
        >
          {{ row.category.label }}
        </NuxtLink>
      </div>
    </li>
  </ul>
</template>

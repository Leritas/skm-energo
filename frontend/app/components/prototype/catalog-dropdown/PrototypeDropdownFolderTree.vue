<script setup lang="ts">
import type { CatalogCategory } from '~/types/catalog';
import { D3P_TREE_THEME } from './d3-themes';
import {
  collectExpandableSlugs,
  flattenCategoryTree,
  type PrototypeCategoryTreeRow,
} from './tree-utils';

const props = withDefaults(
  defineProps<{
    categories: CatalogCategory[];
    buildUrl: (slug: string) => string;
    defaultExpanded?: boolean;
    compact?: boolean;
  }>(),
  {
    defaultExpanded: false,
    compact: false,
  },
);

const theme = D3P_TREE_THEME;

const expandedSlugs = defineModel<Set<string>>('expandedSlugs', {
  default: () => new Set<string>(),
});

if (expandedSlugs.value.size === 0 && props.defaultExpanded) {
  expandedSlugs.value = new Set(collectExpandableSlugs(props.categories));
}

const rows = computed(() =>
  flattenCategoryTree(props.categories, expandedSlugs.value),
);

const rowPadding = computed(() => (props.compact ? 16 : 20));
const rowPy = computed(() => (props.compact ? 'py-1' : 'py-1.5'));
const iconSize = computed(() => (props.compact ? 'size-5' : 'size-6'));
const textSize = computed(() => (props.compact ? 'text-xs' : 'text-sm'));

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

function folderIcon(row: PrototypeCategoryTreeRow) {
  if (!row.hasChildren) {
    return theme.leaf;
  }
  return isExpanded(row.category.slug) ? theme.folderOpen : theme.folderClosed;
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
        class="group flex items-center gap-1 pr-2 transition-colors"
        :class="[rowPy, theme.rowHover]"
        :style="{ paddingLeft: `${8 + row.depth * rowPadding}px` }"
      >
        <button
          v-if="row.hasChildren"
          type="button"
          :class="[
            iconSize,
            'flex shrink-0 items-center justify-center rounded transition',
            theme.chevron,
          ]"
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
        <span v-else :class="[iconSize, 'shrink-0']" />

        <span
          :class="[
            iconSize,
            'flex shrink-0 items-center justify-center rounded-md',
            theme.iconWrap,
          ]"
        >
          <UIcon :name="folderIcon(row)" class="size-3" />
        </span>

        <NuxtLink
          :to="buildUrl(row.category.slug)"
          :class="[
            textSize,
            'min-w-0 flex-1 truncate transition',
            theme.link,
            row.depth === 0 ? 'font-semibold' : 'font-normal',
          ]"
          @click.stop
        >
          {{ row.category.label }}
        </NuxtLink>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { CatalogCategory, CatalogManufacturer } from '~/types/catalog';
import { buildCatalogUrl, getManufacturerLabel } from '~/utils/catalog';
import { collectExpandableCategorySlugs } from '~/utils/catalog-category-tree';

const props = withDefaults(
  defineProps<{
    manufacturers: CatalogManufacturer[];
    categories: CatalogCategory[];
    variant?: 'dropdown' | 'stacked';
  }>(),
  { variant: 'dropdown' },
);

const emit = defineEmits<{
  navigate: [];
}>();

const selectedManufacturerSlug = defineModel<string | null>(
  'selectedManufacturerSlug',
  { default: null },
);

const expandedSlugs = ref<Set<string>>(new Set());

watch(selectedManufacturerSlug, () => {
  expandedSlugs.value = new Set();
});

function isManufacturerSelected(slug: string) {
  return selectedManufacturerSlug.value === slug;
}

function toggleManufacturer(slug: string) {
  selectedManufacturerSlug.value = isManufacturerSelected(slug) ? null : slug;
}

function manufacturerCatalogUrl(slug: string) {
  return buildCatalogUrl(null, slug);
}

function categoryUrl(slug: string) {
  return buildCatalogUrl(slug, selectedManufacturerSlug.value);
}

function catalogRootUrl() {
  return buildCatalogUrl(null, selectedManufacturerSlug.value);
}

const catalogLinkLabel = computed(() => {
  if (!selectedManufacturerSlug.value) {
    return 'Весь каталог';
  }
  return `Каталог · ${getManufacturerLabel(selectedManufacturerSlug.value, props.manufacturers)}`;
});

function expandAll() {
  expandedSlugs.value = new Set(
    collectExpandableCategorySlugs(props.categories),
  );
}

function collapseAll() {
  expandedSlugs.value = new Set();
}

const shellClass = computed(() =>
  props.variant === 'dropdown'
    ? 'w-[40rem] rounded-xl shadow-[0_12px_40px_-10px_rgba(17,24,39,0.28)]'
    : 'rounded-xl shadow-sm ring-1 ring-neutral-200/50',
);

const panelClass = computed(() =>
  props.variant === 'dropdown'
    ? 'flex overflow-hidden rounded-xl bg-white'
    : 'flex flex-col overflow-hidden rounded-xl bg-white',
);

const sidebarClass = computed(() =>
  props.variant === 'dropdown'
    ? 'w-44 shrink-0 border-r border-brand-purple-800 p-3'
    : 'border-b border-brand-purple-800 p-3',
);
</script>

<template>
  <div :class="shellClass">
    <div :class="panelClass">
      <aside class="bg-brand-purple-950" :class="sidebarClass">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-white">
          Производители
        </p>
        <ul
          class="mt-2 space-y-0.5"
          role="radiogroup"
          aria-label="Производители"
        >
          <li
            v-for="manufacturer in manufacturers"
            :key="manufacturer.slug"
            class="flex items-center gap-2 py-1"
          >
            <button
              type="button"
              role="radio"
              :aria-checked="isManufacturerSelected(manufacturer.slug)"
              class="min-w-0 flex-1 px-0.5 text-left text-xs transition"
              :class="
                isManufacturerSelected(manufacturer.slug)
                  ? 'font-semibold text-accent-500'
                  : 'font-medium text-white hover:text-white/90'
              "
              @click="toggleManufacturer(manufacturer.slug)"
            >
              {{ manufacturer.label }}
            </button>
            <NuxtLink
              :to="manufacturerCatalogUrl(manufacturer.slug)"
              class="shrink-0 text-accent-500 transition hover:text-accent-400"
              :aria-label="`Перейти в каталог ${manufacturer.label}`"
              :title="`Каталог ${manufacturer.label}`"
              @click="emit('navigate')"
            >
              <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
            </NuxtLink>
          </li>
        </ul>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col bg-white">
        <div
          class="flex items-center justify-between border-b border-neutral-100 px-3 py-2"
        >
          <NuxtLink
            :to="catalogRootUrl()"
            class="text-xs font-semibold text-accent-600 hover:underline"
            @click="emit('navigate')"
          >
            {{ catalogLinkLabel }}
          </NuxtLink>
          <div class="flex gap-1">
            <button
              type="button"
              class="rounded px-2 py-1 text-[10px] font-medium text-neutral-600 transition hover:bg-neutral-100"
              @click="expandAll"
            >
              Развернуть всё
            </button>
            <button
              type="button"
              class="rounded px-2 py-1 text-[10px] font-medium text-neutral-600 transition hover:bg-neutral-100"
              @click="collapseAll"
            >
              Свернуть
            </button>
          </div>
        </div>
        <div
          class="max-h-[20rem] overflow-y-auto p-2"
          :class="variant === 'stacked' ? 'max-h-[16rem]' : undefined"
        >
          <SkmCatalogFolderTree
            v-if="categories.length"
            v-model:expanded-slugs="expandedSlugs"
            :categories="categories"
            :build-url="categoryUrl"
            @navigate="emit('navigate')"
          />
          <p v-else class="px-2 py-6 text-center text-sm text-neutral-500">
            Нет категорий для выбранного производителя.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

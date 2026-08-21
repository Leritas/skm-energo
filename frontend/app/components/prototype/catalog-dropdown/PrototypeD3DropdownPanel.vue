<script setup lang="ts">
import { D3P_DROPDOWN_THEME } from './d3-themes';
import { filterPrototypeCategoryTree } from './filter-prototype-tree';
import { collectExpandableSlugs } from './tree-utils';
import type { PrototypeCatalogDropdownVariantProps } from './types';
import { usePrototypeDropdownNav } from './usePrototypeDropdownNav';

const props = defineProps<PrototypeCatalogDropdownVariantProps>();

const themeConfig = D3P_DROPDOWN_THEME;

const {
  selectedManufacturerSlug,
  isManufacturerSelected,
  toggleManufacturer,
  manufacturerCatalogUrl,
  categoryUrl,
  manufacturerState,
  manufacturers,
} = usePrototypeDropdownNav(props.data);

const expandedSlugs = ref<Set<string>>(new Set());

const visibleCategories = computed(() =>
  filterPrototypeCategoryTree(
    props.data.categories,
    selectedManufacturerSlug.value,
  ),
);

watch(selectedManufacturerSlug, () => {
  expandedSlugs.value = new Set();
});

function expandAll() {
  expandedSlugs.value = new Set(
    collectExpandableSlugs(visibleCategories.value),
  );
}

function collapseAll() {
  expandedSlugs.value = new Set();
}

const catalogLinkLabel = computed(() => {
  if (!selectedManufacturerSlug.value) {
    return 'Весь каталог';
  }
  const label = manufacturers.find(
    (item) => item.slug === selectedManufacturerSlug.value,
  )?.label;
  return label ? `Каталог · ${label}` : 'Каталог';
});

const stateSummary = computed(
  () =>
    `manufacturer=${manufacturerState.value} · roots=${visibleCategories.value.length} · expanded=${expandedSlugs.value.size}`,
);
</script>

<template>
  <PrototypeDropdownChrome
    :variant-label="themeConfig.label"
    :state-summary="stateSummary"
  >
    <div
      class="flex w-[40rem] overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-lg"
    >
      <aside class="w-44 shrink-0 border-r p-3" :class="themeConfig.sidebar">
        <p
          class="text-[10px] font-semibold uppercase tracking-wide"
          :class="themeConfig.sidebarTitle"
        >
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
                  ? themeConfig.manufacturerActive
                  : themeConfig.manufacturerIdle
              "
              @click="toggleManufacturer(manufacturer.slug)"
            >
              {{ manufacturer.label }}
            </button>
            <NuxtLink
              :to="manufacturerCatalogUrl(manufacturer.slug)"
              class="shrink-0 transition"
              :class="themeConfig.manufacturerGoLink"
              :aria-label="`Перейти в каталог ${manufacturer.label}`"
              :title="`Каталог ${manufacturer.label}`"
            >
              <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
            </NuxtLink>
          </li>
        </ul>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <div
          class="flex items-center justify-between border-b border-neutral-100 px-3 py-2"
        >
          <NuxtLink
            :to="categoryUrl('')"
            class="text-xs font-semibold"
            :class="themeConfig.catalogLink"
          >
            {{ catalogLinkLabel }}
          </NuxtLink>
          <div class="flex gap-1">
            <button
              type="button"
              class="rounded px-2 py-1 text-[10px] font-medium transition"
              :class="themeConfig.toolbarBtn"
              @click="expandAll"
            >
              Развернуть всё
            </button>
            <button
              type="button"
              class="rounded px-2 py-1 text-[10px] font-medium transition"
              :class="themeConfig.toolbarBtn"
              @click="collapseAll"
            >
              Свернуть
            </button>
          </div>
        </div>
        <div class="max-h-[20rem] overflow-y-auto p-2">
          <PrototypeDropdownFolderTree
            v-if="visibleCategories.length"
            v-model:expanded-slugs="expandedSlugs"
            :categories="visibleCategories"
            :build-url="categoryUrl"
          />
          <p v-else class="px-2 py-6 text-center text-sm text-neutral-500">
            Нет категорий для выбранного производителя.
          </p>
        </div>
      </div>
    </div>
  </PrototypeDropdownChrome>
</template>

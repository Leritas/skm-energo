<script setup lang="ts">
import { CATALOG_SEARCH_SPOTLIGHT_THEME } from '~/constants/catalog-search-spotlight-theme';
import SkmCatalogSearchResultList from './SkmCatalogSearchResultList.vue';
import SkmCatalogSearchSuggestions from './SkmCatalogSearchSuggestions.vue';

const open = defineModel<boolean>('open', { default: false });

const { data: manufacturers } = await useCatalogManufacturers();
const { data: categories } = await useCatalogCategories();

const theme = CATALOG_SEARCH_SPOTLIGHT_THEME;

const {
  query,
  isSearching,
  isSearchActive,
  results,
  close,
  clearQuery,
  catalogResultsUrl,
  inputRef,
} = useCatalogSearchSpotlight(open);

function pickSuggestion(value: string) {
  query.value = value;
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      :class="[
        'fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]',
        theme.overlayClass,
      ]"
      @click.self="close"
    >
      <div
        :class="['relative z-[101] w-full max-w-2xl', theme.panelClass]"
        role="dialog"
        aria-label="Поиск по каталогу"
      >
        <div
          :class="[
            'flex min-h-12 items-center gap-3 px-4 py-3',
            theme.inputBarClass,
          ]"
        >
          <UIcon
            name="i-lucide-search"
            :class="['size-5 shrink-0 self-center', theme.iconClass]"
          />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Название, артикул или производитель…"
            :class="[
              'min-w-0 flex-1 self-center bg-transparent py-0 text-base leading-6 outline-none',
              theme.inputClass,
            ]"
            autocomplete="off"
            @keydown.enter.prevent="
              isSearchActive && (close(), navigateTo(catalogResultsUrl()))
            "
          />
          <div class="flex shrink-0 items-center gap-2 self-center">
            <button
              type="button"
              :class="[
                'inline-flex size-8 items-center justify-center rounded-lg transition',
                theme.closeBtnClass,
                query ? '' : 'invisible pointer-events-none',
              ]"
              :tabindex="query ? 0 : -1"
              aria-label="Очистить поиск"
              @click="clearQuery"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
            <button
              type="button"
              :class="[
                'inline-flex h-8 items-center justify-center rounded px-1.5 text-[10px] leading-none transition',
                theme.kbdClass,
                theme.closeBtnClass,
              ]"
              aria-label="Закрыть поиск"
              @click="close"
            >
              Esc
            </button>
          </div>
        </div>

        <div
          v-if="isSearching"
          :class="[
            'px-4 py-8 text-center text-sm',
            theme.bodyClass,
            theme.loadingClass,
          ]"
        >
          Поиск…
        </div>
        <div v-else-if="!isSearchActive" :class="theme.bodyClass">
          <SkmCatalogSearchSuggestions :on-pick="pickSuggestion" />
        </div>
        <div v-else :class="['max-h-[50vh] overflow-y-auto', theme.bodyClass]">
          <SkmCatalogSearchResultList
            :results="results"
            :query="query"
            :categories="categories ?? []"
            :manufacturers="manufacturers ?? []"
            @select="close"
          />
        </div>

        <div
          v-if="isSearchActive && !isSearching"
          :class="[
            'flex items-center justify-between px-4 py-2.5 text-xs',
            theme.footerClass,
          ]"
        >
          <span :class="theme.footerTextClass"
            >{{ results.length }} результатов</span
          >
          <NuxtLink
            :to="catalogResultsUrl()"
            :class="['font-medium', theme.footerLinkClass]"
            @click="close"
          >
            Все результаты →
          </NuxtLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>

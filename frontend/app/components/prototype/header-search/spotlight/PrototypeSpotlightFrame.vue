<script setup lang="ts">
import { usePrototypeSpotlight } from '../usePrototypeSpotlight';

const props = defineProps<{
  designKey: string;
  designName: string;
  overlayClass: string;
  panelClass: string;
  inputBarClass: string;
  inputClass: string;
  iconClass: string;
  kbdClass: string;
  closeBtnClass: string;
  footerClass: string;
  footerTextClass: string;
  footerLinkClass: string;
  loadingClass: string;
  bodyClass?: string;
}>();

const {
  query,
  isOpen,
  isSearching,
  isSearchActive,
  results,
  open,
  close,
  clearQuery,
  catalogResultsUrl,
  inputRef,
  stateSummary,
} = usePrototypeSpotlight(`${props.designKey} — ${props.designName}`);
</script>

<template>
  <PrototypeSearchChrome
    :variant-label="`${designKey} — ${designName}`"
    :state-summary="stateSummary"
    @search-click="open"
  />

  <Teleport to="body">
    <div
      v-if="isOpen"
      :class="[
        'fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]',
        overlayClass,
      ]"
      @click.self="close"
    >
      <div
        :class="[
          'relative z-[101] w-full max-w-2xl overflow-hidden shadow-2xl',
          panelClass,
        ]"
        role="dialog"
        aria-label="Поиск по каталогу"
      >
        <div
          :class="['flex min-h-12 items-center gap-3 px-4 py-3', inputBarClass]"
        >
          <UIcon
            name="i-lucide-search"
            :class="['size-5 shrink-0 self-center', iconClass]"
          />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Название, артикул или производитель…"
            :class="[
              'min-w-0 flex-1 self-center bg-transparent py-0 text-base leading-6 outline-none',
              inputClass,
            ]"
            autocomplete="off"
            @keydown.enter.prevent="
              isSearchActive && navigateTo(catalogResultsUrl())
            "
          />
          <div class="flex shrink-0 items-center gap-2 self-center">
            <button
              type="button"
              :class="[
                'inline-flex size-8 items-center justify-center rounded-lg transition',
                closeBtnClass,
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
                kbdClass,
                closeBtnClass,
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
          :class="['px-4 py-8 text-center text-sm', bodyClass, loadingClass]"
        >
          Поиск…
        </div>
        <div v-else-if="!isSearchActive" :class="bodyClass">
          <slot name="empty" :pick="(value: string) => (query = value)" />
        </div>
        <div v-else :class="['max-h-[50vh] overflow-y-auto', bodyClass]">
          <slot name="results" :results="results" :query="query" />
        </div>

        <div
          v-if="isSearchActive && !isSearching"
          :class="[
            'flex items-center justify-between px-4 py-2.5 text-xs',
            footerClass,
          ]"
        >
          <span :class="footerTextClass">{{ results.length }} результатов</span>
          <NuxtLink
            :to="catalogResultsUrl()"
            :class="['font-medium', footerLinkClass]"
            @click="close"
          >
            Все результаты →
          </NuxtLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!--
  PROTOTYPE (#70) — Verdict: A2 (see docs/superpowers/specs/2026-08-20-catalog-category-page-visual.md)
  Preview: /prototype/catalog-category?variant=A2
-->
<script setup lang="ts">
import { PROTOTYPE_CATALOG_CATEGORY_DATA } from '~/components/prototype/catalog-category/mock-data';

const PROTOTYPE_VARIANTS = [
  { key: 'A1', name: 'A — широкие плитки + сетка' },
  { key: 'A2', name: 'A — 3 кол. подкатегории + 4 кол. товары' },
  { key: 'A3', name: 'A — строки подкатегорий + список товаров' },
  { key: 'B1', name: 'B — сайдбар с превью + сетка' },
  { key: 'B2', name: 'B — текстовый сайдбар + 2 кол.' },
  { key: 'B3', name: 'B — сайдбар + hero + «Все товары»' },
] as const;

type PrototypeVariantKey = (typeof PROTOTYPE_VARIANTS)[number]['key'];

const route = useRoute();

const isDev = import.meta.dev;

const variant = computed<PrototypeVariantKey>(() => {
  const raw = route.query.variant;
  const key = typeof raw === 'string' ? raw.toUpperCase() : 'A1';
  return PROTOTYPE_VARIANTS.some((item) => item.key === key)
    ? (key as PrototypeVariantKey)
    : 'A1';
});

useSeoMeta({
  title: `PROTOTYPE — категория каталога (${variant.value})`,
  robots: 'noindex, nofollow',
});
</script>

<template>
  <div>
    <div
      v-if="isDev"
      class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
    >
      Прототип #70 — throwaway UI, не для продакшена. ← → для переключения
      вариантов.
    </div>

    <VariantA1StackedWide
      v-if="variant === 'A1'"
      :data="PROTOTYPE_CATALOG_CATEGORY_DATA"
    />
    <VariantA2StackedGrid
      v-else-if="variant === 'A2'"
      :data="PROTOTYPE_CATALOG_CATEGORY_DATA"
    />
    <VariantA3StackedRows
      v-else-if="variant === 'A3'"
      :data="PROTOTYPE_CATALOG_CATEGORY_DATA"
    />
    <VariantB1SidebarThumbs
      v-else-if="variant === 'B1'"
      :data="PROTOTYPE_CATALOG_CATEGORY_DATA"
    />
    <VariantB2SidebarText
      v-else-if="variant === 'B2'"
      :data="PROTOTYPE_CATALOG_CATEGORY_DATA"
    />
    <VariantB3SidebarHero
      v-else-if="variant === 'B3'"
      :data="PROTOTYPE_CATALOG_CATEGORY_DATA"
    />

    <PrototypeSwitcher :variants="[...PROTOTYPE_VARIANTS]" :current="variant" />
  </div>
</template>

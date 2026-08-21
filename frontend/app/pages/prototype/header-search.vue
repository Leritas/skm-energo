<!--
  PROTOTYPE (#68) — Verdict: Final purple-header spotlight
  (see docs/superpowers/specs/2026-08-21-catalog-header-search-visual.md)
  Preview: /prototype/header-search
-->
<script setup lang="ts">
definePageMeta({ layout: false });

const isDev = import.meta.dev;

useSeoMeta({
  title: 'PROTOTYPE — spotlight поиск (final)',
  robots: 'noindex, nofollow',
});
</script>

<template>
  <div>
    <div
      v-if="isDev"
      class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
    >
      Прототип #68 — вердикт зафиксирован в spec. Фиолетовая шапка + 3 строки
      meta. Поиск от 2 символов. Введите MERSEN.
    </div>

    <VariantFinal_Spotlight />
  </div>
</template>

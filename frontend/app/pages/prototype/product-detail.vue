<!--
  PROTOTYPE (#71) — Verdict: final classic (see docs/superpowers/specs/2026-08-20-pdp-visual.md)
  Preview: /prototype/product-detail
-->
<script setup lang="ts">
import { PROTOTYPE_PRODUCT_DETAIL_DATA } from '~/components/prototype/product-detail/mock-data';

const isDev = import.meta.dev;

useSeoMeta({
  title: 'PROTOTYPE — PDP (final)',
  robots: 'noindex, nofollow',
});
</script>

<template>
  <div>
    <div
      v-if="isDev"
      class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
    >
      Прототип #71 — финальный вариант: классика + документы строками в табе.
      Таб «Документы» открыт по умолчанию.
    </div>

    <VariantFinalClassic :data="PROTOTYPE_PRODUCT_DETAIL_DATA" />
  </div>
</template>

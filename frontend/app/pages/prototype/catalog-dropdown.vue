<!--
  PROTOTYPE (#72) — Verdict: D3P (see docs/superpowers/specs/2026-08-21-catalog-header-dropdown-visual.md)
  Preview: /prototype/catalog-dropdown
-->
<script setup lang="ts">
import { PROTOTYPE_CATALOG_DROPDOWN_DATA } from '~/components/prototype/catalog-dropdown/mock-data';

definePageMeta({ layout: false });

const isDev = import.meta.dev;

useSeoMeta({
  title: 'PROTOTYPE — dropdown каталога (D3P)',
  robots: 'noindex, nofollow',
});
</script>

<template>
  <div>
    <div
      v-if="isDev"
      class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
    >
      Прототип #72 — D3P (вердикт зафиксирован в spec). Throwaway UI.
    </div>

    <PrototypeD3DropdownPanel :data="PROTOTYPE_CATALOG_DROPDOWN_DATA" />
  </div>
</template>

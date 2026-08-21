<script setup lang="ts">
import PrototypeSpotlightFrame from './PrototypeSpotlightFrame.vue';
import { PURPLE_HEADER_SPOTLIGHT_PROPS } from './purpleHeaderSpotlightProps';
import SpotlightRowsB3_ArtikulBadges from './SpotlightRowsB3_ArtikulBadges.vue';
</script>

<template>
  <PrototypeSpotlightFrame
    v-bind="PURPLE_HEADER_SPOTLIGHT_PROPS"
    design-key="B3"
    design-name="Артикул + бейджи"
  >
    <template #empty="{ pick }">
      <PrototypeSearchSuggestions :on-pick="pick" />
    </template>
    <template #results="{ results, query }">
      <SpotlightRowsB3_ArtikulBadges :results="results" :query="query" />
    </template>
  </PrototypeSpotlightFrame>
</template>

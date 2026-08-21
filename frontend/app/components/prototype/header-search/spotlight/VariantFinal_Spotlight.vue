<script setup lang="ts">
import PrototypeSpotlightFrame from './PrototypeSpotlightFrame.vue';
import { PURPLE_HEADER_SPOTLIGHT_PROPS } from './purpleHeaderSpotlightProps';
import SpotlightRowsFinal_Full from './SpotlightRowsFinal_Full.vue';
</script>

<template>
  <PrototypeSpotlightFrame
    v-bind="PURPLE_HEADER_SPOTLIGHT_PROPS"
    design-key="Final"
    design-name="Full meta row"
  >
    <template #empty="{ pick }">
      <PrototypeSearchSuggestions :on-pick="pick" />
    </template>
    <template #results="{ results, query }">
      <SpotlightRowsFinal_Full :results="results" :query="query" />
    </template>
  </PrototypeSpotlightFrame>
</template>

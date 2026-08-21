<script setup lang="ts">
import PrototypeSpotlightFrame from './PrototypeSpotlightFrame.vue';
import { PURPLE_HEADER_SPOTLIGHT_PROPS } from './purpleHeaderSpotlightProps';
import SpotlightRowsB2_Category from './SpotlightRowsB2_Category.vue';
</script>

<template>
  <PrototypeSpotlightFrame
    v-bind="PURPLE_HEADER_SPOTLIGHT_PROPS"
    design-key="B2"
    design-name="Производитель + категория"
  >
    <template #empty="{ pick }">
      <PrototypeSearchSuggestions :on-pick="pick" />
    </template>
    <template #results="{ results, query }">
      <SpotlightRowsB2_Category :results="results" :query="query" />
    </template>
  </PrototypeSpotlightFrame>
</template>

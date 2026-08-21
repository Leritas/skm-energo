<script setup lang="ts">
import PrototypeSpotlightFrame from './PrototypeSpotlightFrame.vue';
import { PURPLE_HEADER_SPOTLIGHT_PROPS } from './purpleHeaderSpotlightProps';
import SpotlightRowsB1_Badges from './SpotlightRowsB1_Badges.vue';
</script>

<template>
  <PrototypeSpotlightFrame
    v-bind="PURPLE_HEADER_SPOTLIGHT_PROPS"
    design-key="B1"
    design-name="Производитель + бейджи"
  >
    <template #empty="{ pick }">
      <PrototypeSearchSuggestions :on-pick="pick" />
    </template>
    <template #results="{ results, query }">
      <SpotlightRowsB1_Badges :results="results" :query="query" />
    </template>
  </PrototypeSpotlightFrame>
</template>

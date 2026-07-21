<script setup lang="ts">
import type { SkmTabItem } from './types'

defineProps<{
  items: SkmTabItem[]
}>()

const model = defineModel<string | number>({ default: undefined })
</script>

<template>
  <UTabs
    v-model="model"
    :items="items"
    color="primary"
    variant="link"
  >
    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps ?? {}"
      />
    </template>
  </UTabs>
</template>

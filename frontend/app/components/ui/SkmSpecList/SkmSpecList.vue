<script setup lang="ts">
import type { SkmSpecItem } from './types'

defineProps<{
  items: SkmSpecItem[]
}>()
</script>

<template>
  <dl class="divide-y divide-neutral-100 border-y border-neutral-100">
    <div
      v-for="item in items"
      :key="item.label"
      class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4"
    >
      <dt class="text-sm font-medium text-neutral-500">
        {{ item.label }}
      </dt>
      <dd class="text-sm text-neutral-950 sm:col-span-2">
        {{ item.value }}
      </dd>
    </div>
  </dl>
</template>

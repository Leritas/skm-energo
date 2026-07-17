<script setup lang="ts">
import type { SkmBreadcrumbItem } from './types'

defineProps<{
  items: SkmBreadcrumbItem[]
}>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="mb-6">
    <ol class="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="flex items-center gap-1"
      >
        <span v-if="index > 0" class="text-neutral-300" aria-hidden="true">
          /
        </span>
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="transition-colors hover:text-accent-600"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="font-medium text-neutral-900"
          aria-current="page"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>


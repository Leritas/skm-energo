<script setup lang="ts">
import type { CatalogItem } from '~/constants/navigation'

defineProps<{
  items: CatalogItem[]
}>()
</script>

<template>
  <nav aria-label="Категории каталога" class="space-y-1">
    <div
      v-for="item in items"
      :key="item.label"
      class="py-1"
    >
      <NuxtLink
        :to="item.to ?? '/catalog'"
        class="block rounded-md px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 hover:text-accent-600"
      >
        {{ item.label }}
      </NuxtLink>
      <ul
        v-if="item.children?.length"
        class="mt-1 space-y-0.5 border-l border-neutral-200 pl-3"
      >
        <li
          v-for="child in item.children"
          :key="child.label"
        >
          <NuxtLink
            :to="child.to ?? item.to ?? '/catalog'"
            class="block rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-accent-600"
          >
            {{ child.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { CATALOG_TREE } from '~/constants/navigation'

const open = ref(false)
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'start' }">
    <button
      type="button"
      class="flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors hover:text-accent-600"
    >
      Продукция
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <template #content>
      <div class="w-72 p-2">
        <div
          v-for="item in CATALOG_TREE"
          :key="item.label"
          class="border-b border-neutral-100 last:border-0"
        >
          <NuxtLink
            :to="item.to ?? '/catalog'"
            class="block rounded-md px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 hover:text-accent-600"
            @click="open = false"
          >
            {{ item.label }}
          </NuxtLink>
          <ul v-if="item.children?.length" class="pb-2 pl-3">
            <li v-for="child in item.children" :key="child.label">
              <span class="block px-3 py-1 text-xs text-neutral-500">
                {{ child.label }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </UPopover>
</template>

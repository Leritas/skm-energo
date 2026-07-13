<script setup lang="ts">
import { CATALOG_TREE } from '~/constants/navigation'

const open = ref(false)
</script>

<template>
  <UPopover
    v-model:open="open"
    :content="{
      align: 'start',
      class:
        '!bg-white p-0 shadow-lg ring-1 ring-neutral-100/80',
    }"
  >
    <button
      type="button"
      class="flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors hover:text-accent-600"
      :class="{ 'text-accent-600': open }"
    >
      Продукция
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <template #content>
      <div class="w-80 py-1">
        <div
          v-for="item in CATALOG_TREE"
          :key="item.label"
          class="border-b border-brand-purple-200 last:border-0"
        >
          <NuxtLink
            :to="item.to ?? '/catalog'"
            class="block px-4 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-brand-purple-50 hover:text-accent-600"
            @click="open = false"
          >
            {{ item.label }}
          </NuxtLink>
          <ul v-if="item.children?.length" class="space-y-0.5 px-4 pb-3">
            <li v-for="child in item.children" :key="child.label">
              <span class="block py-1 text-xs leading-snug text-neutral-600">
                {{ child.label }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </UPopover>
</template>

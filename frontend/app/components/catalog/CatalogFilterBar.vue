<script setup lang="ts">
import type { CatalogManufacturer } from '~/types/catalog'
import { SkmSearchBox } from '@skm/components'

const props = withDefaults(
  defineProps<{
    manufacturers: CatalogManufacturer[]
    query?: string
    activeManufacturerSlug?: string | null
  }>(),
  {
    query: '',
    activeManufacturerSlug: null,
  },
)

const emit = defineEmits<{
  'update:query': [value: string]
  'toggle-manufacturer': [slug: string | null]
  submit: [value: string]
}>()

function onQueryUpdate(value: string) {
  emit('update:query', value)
}

function toggleManufacturer(slug: string) {
  emit(
    'toggle-manufacturer',
    props.activeManufacturerSlug === slug ? null : slug,
  )
}
</script>

<template>
  <div class="space-y-3">
    <SkmSearchBox
      :model-value="query"
      placeholder="Поиск по каталогу"
      @update:model-value="onQueryUpdate"
      @submit="emit('submit', $event)"
    />
    <div class="flex flex-wrap gap-2">
      <button
        v-for="manufacturer in manufacturers"
        :key="manufacturer.slug"
        type="button"
        class="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        @click="toggleManufacturer(manufacturer.slug)"
      >
        <SkmBadge
          :label="manufacturer.label"
          :tone="activeManufacturerSlug === manufacturer.slug ? 'accent' : 'neutral'"
          size="sm"
        />
      </button>
    </div>
  </div>
</template>

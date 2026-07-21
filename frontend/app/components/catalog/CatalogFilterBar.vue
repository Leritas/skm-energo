<script setup lang="ts">
import { SkmBadge, SkmSearchBox } from '@skm/components'

const props = withDefaults(
  defineProps<{
    query?: string
    chips?: string[]
    activeChip?: string | null
  }>(),
  {
    query: '',
    chips: () => [],
    activeChip: null,
  },
)

const emit = defineEmits<{
  'update:query': [value: string]
  'update:activeChip': [value: string | null]
  submit: [value: string]
}>()

function onQueryUpdate(value: string) {
  emit('update:query', value)
}

function toggleChip(chip: string) {
  emit('update:activeChip', props.activeChip === chip ? null : chip)
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
    <div
      v-if="chips.length"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="chip in chips"
        :key="chip"
        type="button"
        class="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        @click="toggleChip(chip)"
      >
        <SkmBadge
          :label="chip"
          :tone="activeChip === chip ? 'accent' : 'neutral'"
          size="sm"
        />
      </button>
    </div>
  </div>
</template>

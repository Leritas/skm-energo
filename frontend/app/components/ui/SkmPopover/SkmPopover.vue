<script setup lang="ts">
import { computed } from 'vue'
import type { SkmPopoverVariant } from '../presets'

const props = withDefaults(
  defineProps<{
    variant?: SkmPopoverVariant
  }>(),
  { variant: 'default' },
)

const open = defineModel<boolean>('open', { default: false })

const content = computed(() => {
  switch (props.variant) {
    case 'default':
      return {
        side: 'bottom' as const,
        sideOffset: 8,
      }
    case 'catalog':
      return {
        align: 'start' as const,
        class: '!bg-white p-0 shadow-lg ring-1 ring-neutral-100/80',
      }
    default: {
      const _exhaustive: never = props.variant
      return _exhaustive
    }
  }
})
</script>

<template>
  <UPopover v-model:open="open" :content="content">
    <slot :open="open" />
    <template #content="slotProps">
      <slot name="content" v-bind="slotProps" />
    </template>
  </UPopover>
</template>

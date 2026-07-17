<script setup lang="ts">
import { computed } from 'vue'
import { skmPopoverContent, type SkmPopoverVariant } from '../presets'

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
      return skmPopoverContent.default
    case 'catalog':
      return skmPopoverContent.catalog
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

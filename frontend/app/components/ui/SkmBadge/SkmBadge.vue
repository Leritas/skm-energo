<script setup lang="ts">
import { computed } from 'vue'
import type { SkmBadgeSize, SkmBadgeTone } from './types'

const props = withDefaults(
  defineProps<{
    label?: string | number
    tone?: SkmBadgeTone
    size?: SkmBadgeSize
  }>(),
  {
    label: undefined,
    tone: 'neutral',
    size: 'md',
  },
)

const color = computed(() => {
  switch (props.tone) {
    case 'neutral':
      return 'neutral'
    case 'accent':
      return 'primary'
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'danger':
      return 'error'
    default: {
      const _exhaustive: never = props.tone
      return _exhaustive
    }
  }
})
</script>

<template>
  <UBadge :label="label" :color="color" :size="size" variant="solid">
    <slot />
  </UBadge>
</template>

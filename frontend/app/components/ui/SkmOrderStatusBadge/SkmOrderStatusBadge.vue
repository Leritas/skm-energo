<script setup lang="ts">
import { computed } from 'vue'
import SkmBadge from '../SkmBadge/SkmBadge.vue'
import type { SkmBadgeTone } from '../SkmBadge/types'
import type { SkmOrderStatus } from './types'

const props = defineProps<{
  status: SkmOrderStatus
}>()

const label = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'Ожидает'
    case 'processing':
      return 'В работе'
    case 'shipped':
      return 'Отправлен'
    case 'completed':
      return 'Выполнен'
    case 'cancelled':
      return 'Отменён'
    default: {
      const _exhaustive: never = props.status
      return _exhaustive
    }
  }
})

const tone = computed((): SkmBadgeTone => {
  switch (props.status) {
    case 'pending':
      return 'warning'
    case 'processing':
      return 'accent'
    case 'shipped':
      return 'neutral'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'danger'
    default: {
      const _exhaustive: never = props.status
      return _exhaustive
    }
  }
})
</script>

<template>
  <SkmBadge
    :label="label"
    :tone="tone"
    size="sm"
  />
</template>

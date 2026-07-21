<script setup lang="ts">
import { computed } from 'vue'
import type { SkmAlertTone } from './types'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    tone?: SkmAlertTone
    icon?: string
  }>(),
  {
    title: undefined,
    description: undefined,
    tone: 'neutral',
    icon: undefined,
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
  <UAlert
    :title="title"
    :description="description"
    :color="color"
    :icon="icon"
    variant="subtle"
  >
    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps ?? {}"
      />
    </template>
  </UAlert>
</template>

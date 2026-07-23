<script setup lang="ts">
import { skmInputUi, type SkmFieldVariant } from '../presets'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: SkmFieldVariant
    ui?: Record<string, unknown>
    class?: unknown
  }>(),
  {
    variant: 'default',
    ui: undefined,
    class: undefined,
  },
)
</script>

<template>
  <UTextarea
    v-bind="$attrs"
    :class="props.class"
    :ui="{ ...skmInputUi[props.variant], ...(props.ui ?? {}) }"
  />
</template>


<script setup lang="ts">
import { computed } from 'vue'
import {
  skmButtonBrandUi,
  type SkmButtonTone,
} from '../presets'

type SkmButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type SkmButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: SkmButtonVariant
    tone?: SkmButtonTone
    size?: SkmButtonSize
    to?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    icon?: string
  }>(),
  {
    variant: 'primary',
    tone: 'light',
    size: 'md',
    type: 'button',
    disabled: false,
    to: undefined,
    icon: undefined,
  },
)

const color = computed(() =>
  props.variant === 'primary' ? 'primary' : 'neutral',
)

const uiVariant = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'solid'
    case 'secondary':
      return 'soft'
    case 'outline':
      return 'outline'
    case 'ghost':
      return 'ghost'
    default: {
      const _exhaustive: never = props.variant
      return _exhaustive
    }
  }
})

const ui = computed(() => {
  if (props.tone !== 'brand') {
    return undefined
  }

  switch (props.variant) {
    case 'primary':
      return skmButtonBrandUi.primary
    case 'secondary':
      return skmButtonBrandUi.secondary
    case 'outline':
      return skmButtonBrandUi.outline
    case 'ghost':
      return skmButtonBrandUi.ghost
    default: {
      const _exhaustive: never = props.variant
      return _exhaustive
    }
  }
})
</script>

<template>
  <UButton
    :color="color"
    :variant="uiVariant"
    :size="size"
    :to="to"
    :type="type"
    :disabled="disabled"
    :icon="icon"
    :ui="ui"
  >
    <slot />
  </UButton>
</template>

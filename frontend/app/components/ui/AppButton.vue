<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    to?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
  },
)

const color = computed(() =>
  props.variant === 'primary' ? 'accent' : 'neutral',
)

const uiVariant = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'solid'
    case 'secondary':
      return 'soft'
    case 'outline':
      return 'outline'
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
  >
    <slot />
  </UButton>
</template>

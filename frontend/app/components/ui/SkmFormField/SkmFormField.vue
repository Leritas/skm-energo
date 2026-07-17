<script setup lang="ts">
import { skmFormFieldUi, type SkmFormTone } from '../presets'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    tone?: SkmFormTone
    label?: string
    name?: string
    required?: boolean
    hint?: string
    description?: string
    help?: string
    error?: boolean | string
    ui?: Record<string, unknown>
    class?: unknown
  }>(),
  {
    tone: 'light',
    label: undefined,
    name: undefined,
    required: false,
    hint: undefined,
    description: undefined,
    help: undefined,
    error: undefined,
    ui: undefined,
    class: undefined,
  },
)
</script>

<template>
  <UFormField
    v-bind="$attrs"
    :class="props.class"
    :label="props.label"
    :name="props.name"
    :required="props.required"
    :hint="props.hint"
    :description="props.description"
    :help="props.help"
    :error="props.error"
    :ui="{ ...skmFormFieldUi[props.tone], ...(props.ui ?? {}) }"
  >
    <slot />
  </UFormField>
</template>


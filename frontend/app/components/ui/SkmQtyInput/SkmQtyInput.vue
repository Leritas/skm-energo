<script setup lang="ts">
import { computed } from 'vue'
import SkmButton from '../SkmButton/SkmButton.vue'

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    disabled?: boolean
  }>(),
  {
    min: 1,
    max: 999,
    disabled: false,
  },
)

const model = defineModel<number>({ default: 1 })

const canDec = computed(() => !props.disabled && model.value > props.min)
const canInc = computed(() => !props.disabled && model.value < props.max)

function dec() {
  if (canDec.value) {
    model.value -= 1
  }
}

function inc() {
  if (canInc.value) {
    model.value += 1
  }
}
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <SkmButton
      variant="outline"
      size="sm"
      :disabled="!canDec"
      aria-label="Уменьшить"
      @click="dec"
    >
      −
    </SkmButton>
    <span
      class="min-w-10 text-center text-sm font-medium tabular-nums text-neutral-950"
      aria-live="polite"
    >
      {{ model }}
    </span>
    <SkmButton
      variant="outline"
      size="sm"
      :disabled="!canInc"
      aria-label="Увеличить"
      @click="inc"
    >
      +
    </SkmButton>
  </div>
</template>

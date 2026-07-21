<script setup lang="ts">
import SkmButton from '../SkmButton/SkmButton.vue'

withDefaults(
  defineProps<{
    linesCount: number
    totalLabel?: string
    checkoutTo?: string
  }>(),
  {
    totalLabel: 'по запросу',
    checkoutTo: '/checkout',
  },
)
</script>

<template>
  <aside class="rounded-xl border border-neutral-100 bg-neutral-50 p-6">
    <h2 class="text-lg font-semibold text-neutral-950">
      Итого
    </h2>
    <p class="mt-2 text-sm text-neutral-600">
      Позиций: {{ linesCount }}
    </p>
    <p class="mt-4 text-base font-medium text-neutral-950">
      {{ totalLabel }}
    </p>
    <div class="mt-6">
      <slot>
        <SkmButton
          class="w-full justify-center"
          variant="primary"
          :to="checkoutTo"
        >
          Оформить
        </SkmButton>
      </slot>
    </div>
  </aside>
</template>

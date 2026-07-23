<script setup lang="ts">
import SkmOrderStatusBadge from '../SkmOrderStatusBadge/SkmOrderStatusBadge.vue'
import type { SkmOrderStatus } from '../SkmOrderStatusBadge/types'

withDefaults(
  defineProps<{
    number: string
    dateLabel: string
    status: SkmOrderStatus
    totalLabel?: string
    to?: string
  }>(),
  {
    totalLabel: 'по запросу',
    to: undefined,
  },
)
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    class="block rounded-xl border border-neutral-100 bg-white p-5 shadow-sm transition-shadow"
    :class="to ? 'hover:shadow-md' : ''"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-neutral-950">
          Заказ {{ number }}
        </p>
        <p class="mt-1 text-xs text-neutral-500">
          {{ dateLabel }}
        </p>
      </div>
      <SkmOrderStatusBadge :status="status" />
    </div>
    <p class="mt-4 text-sm text-neutral-600">
      Сумма: <span class="font-medium text-neutral-950">{{ totalLabel }}</span>
    </p>
  </component>
</template>

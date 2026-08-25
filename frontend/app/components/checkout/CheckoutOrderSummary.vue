<script setup lang="ts">
import { useProvidedCheckoutContext } from '~/composables/useCheckoutContext';

const ctx = useProvidedCheckoutContext();
</script>

<template>
  <div class="mt-6 border-t border-white/20 pt-5">
    <dl class="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
      <dt class="text-white/60">Наименований</dt>
      <dd class="text-right font-medium tabular-nums">
        {{ ctx.lineItemsCount.value }}
      </dd>
      <dt class="text-white/60">Количество</dt>
      <dd class="text-right font-medium tabular-nums">
        {{ ctx.totalQuantity.value }} шт.
      </dd>
    </dl>

    <div
      class="mt-4 flex items-baseline justify-between gap-4 border-t border-white/10 pt-4"
    >
      <span class="text-sm text-white/60">Сумма</span>
      <span class="text-right text-xl font-semibold tabular-nums leading-tight">
        {{ ctx.totalLabel.value }}
      </span>
    </div>
  </div>
</template>

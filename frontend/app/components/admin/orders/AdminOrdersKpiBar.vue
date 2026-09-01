<script setup lang="ts">
import type { AdminOrdersKpi } from '~/constants/admin-orders';

defineProps<{
  stats: AdminOrdersKpi;
}>();
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p class="text-xs font-medium uppercase text-amber-700">Ожидают</p>
      <p class="text-2xl font-bold text-amber-900">
        {{ stats.pending }}
      </p>
    </div>
    <div class="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3">
      <p class="text-xs font-medium uppercase text-accent-700">В работе</p>
      <p class="text-2xl font-bold text-accent-900">
        {{ stats.processing }}
      </p>
    </div>
    <div class="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
      <p class="text-xs font-medium uppercase text-sky-700">Отправлены</p>
      <p class="text-2xl font-bold text-sky-900">
        {{ stats.shipped }}
      </p>
    </div>
    <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <p class="text-xs font-medium uppercase text-emerald-700">
        Сумма (оплаченные)
      </p>
      <p class="text-2xl font-bold text-emerald-900">
        {{ stats.paidRevenueLabel }}
      </p>
    </div>
  </div>
</template>

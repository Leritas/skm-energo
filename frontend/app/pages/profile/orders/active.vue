<script setup lang="ts">
import { PROFILE_ACTIVE_ORDERS } from '~/constants/profile-mocks'

const orders = PROFILE_ACTIVE_ORDERS
</script>

<template>
  <div v-if="orders.length === 0">
    <p class="text-sm text-neutral-500">
      Пока нет заказов
    </p>
  </div>
  <div
    v-else
    class="grid gap-4 sm:grid-cols-2"
  >
    <SkmOrderCard
      v-for="order in orders"
      :key="order.number"
      :number="order.number"
      :date-label="order.dateLabel"
      :status="order.status"
      :total-label="order.totalLabel"
    />
  </div>
</template>

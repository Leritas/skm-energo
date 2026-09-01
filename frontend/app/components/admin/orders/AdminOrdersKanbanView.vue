<script setup lang="ts">
import type { OrderDto } from '@skm/specs';
import { OrderStatus } from '@skm/specs';
import {
  formatOrderDate,
  formatOrderTotal,
  getKanbanTransitionButtonClass,
  getPrimaryStatusTransition,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_COLUMN_LABELS,
  orderTypeBadgeClass,
  orderTypeLabel,
  paymentStatusLabel,
} from '~/constants/admin-orders';
import { useAdminOrdersState } from '~/composables/useAdminOrdersState';

const props = defineProps<{
  selectedOrderId: number | null;
}>();

const emit = defineEmits<{
  select: [order: OrderDto];
  open: [order: OrderDto];
}>();

const { orders, canManage, transitionOrder } = useAdminOrdersState();

const columns = [
  OrderStatus.pending,
  OrderStatus.processing,
  OrderStatus.shipped,
  OrderStatus.completed,
  OrderStatus.cancelled,
] as const;

const ordersByStatus = computed(() => {
  const map = new Map<OrderStatus, OrderDto[]>();
  for (const status of columns) {
    map.set(status, []);
  }
  for (const order of orders.value) {
    map.get(order.status)?.push(order);
  }
  return map;
});

function isSelected(order: OrderDto) {
  return props.selectedOrderId === order.id;
}

function primaryTransition(order: OrderDto) {
  return getPrimaryStatusTransition(order.status);
}

function handleTransition(order: OrderDto) {
  const transition = primaryTransition(order);
  if (!transition) {
    return;
  }
  void transitionOrder(order.id, transition.target);
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-1">
    <section
      v-for="status in columns"
      :key="status"
      class="flex w-72 shrink-0 flex-col rounded-xl border bg-white shadow-sm"
      :class="ORDER_STATUS_COLORS[status].border"
    >
      <header
        class="flex items-center justify-between rounded-t-xl border-b px-4 py-3"
        :class="[
          ORDER_STATUS_COLORS[status].bg,
          ORDER_STATUS_COLORS[status].border,
        ]"
      >
        <div class="flex items-center gap-2">
          <span
            class="size-2.5 rounded-full"
            :class="ORDER_STATUS_COLORS[status].dot"
          />
          <h2
            class="text-sm font-semibold"
            :class="ORDER_STATUS_COLORS[status].text"
          >
            {{ ORDER_STATUS_COLUMN_LABELS[status] }}
          </h2>
        </div>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium"
          :class="[
            ORDER_STATUS_COLORS[status].bg,
            ORDER_STATUS_COLORS[status].text,
          ]"
        >
          {{ ordersByStatus.get(status)?.length ?? 0 }}
        </span>
      </header>

      <div class="flex min-h-[320px] flex-1 flex-col gap-3 p-3">
        <article
          v-for="order in ordersByStatus.get(status)"
          :key="order.id"
          class="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
          :class="
            isSelected(order)
              ? 'border-accent-400 ring-2 ring-accent-100'
              : 'border-neutral-200'
          "
        >
          <div class="h-1" :class="ORDER_STATUS_COLORS[order.status].dot" />

          <button
            type="button"
            class="w-full p-3 text-left"
            @click="emit('select', order)"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-neutral-950">
                {{ order.number }}
              </p>
              <span
                class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                :class="orderTypeBadgeClass(order.type)"
              >
                {{ orderTypeLabel(order.type) }}
              </span>
            </div>
            <p class="mt-1 text-xs text-neutral-500">
              {{ formatOrderDate(order.createdAt) }}
            </p>
            <p class="mt-2 text-sm font-medium text-neutral-800">
              {{ order.customerName }}
            </p>
            <p class="truncate text-xs text-neutral-500">
              {{ order.customerEmail }}
            </p>
            <div class="mt-2 flex items-center justify-between text-sm">
              <span class="font-semibold text-neutral-900">
                {{ formatOrderTotal(order) }}
              </span>
              <span class="text-xs text-neutral-400">
                {{ paymentStatusLabel(order.paymentStatus) }}
              </span>
            </div>
          </button>

          <div class="flex gap-1 border-t border-neutral-100 bg-neutral-50 p-2">
            <button
              v-if="canManage && primaryTransition(order)"
              type="button"
              class="flex-1 rounded-md py-1.5 text-xs font-semibold text-white transition"
              :class="
                getKanbanTransitionButtonClass(primaryTransition(order)!.target)
              "
              @click="handleTransition(order)"
            >
              → {{ primaryTransition(order)!.label }}
            </button>
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-white"
              :class="canManage && primaryTransition(order) ? '' : 'flex-1'"
              @click="emit('open', order)"
            >
              Открыть
            </button>
          </div>
        </article>

        <p
          v-if="(ordersByStatus.get(status)?.length ?? 0) === 0"
          class="flex flex-1 items-center justify-center py-8 text-center text-xs text-neutral-400"
        >
          Нет заказов
        </p>
      </div>
    </section>
  </div>
</template>

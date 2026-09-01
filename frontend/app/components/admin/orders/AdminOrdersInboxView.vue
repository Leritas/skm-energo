<script setup lang="ts">
import type { OrderDto, OrderStatus } from '@skm/specs';
import {
  formatOrderDate,
  formatOrderTotal,
  getInboxStatusActions,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_COLUMN_LABELS,
  orderTypeBadgeClass,
  orderTypeLabel,
  paymentStatusLabel,
} from '~/constants/admin-orders';
import { OrderType, PaymentStatus } from '@skm/specs';
import { useAdminOrdersState } from '~/composables/useAdminOrdersState';

type ListFilter = OrderStatus | 'all';

const props = defineProps<{
  selectedOrderId: number | null;
}>();

const emit = defineEmits<{
  select: [order: OrderDto];
}>();

const { orders, canManage, transitionOrder, markOrderPaid } =
  useAdminOrdersState();

const activeFilter = ref<ListFilter>('all');
const searchQuery = ref('');

const filters = computed(() => {
  const all = orders.value.length;
  const byStatus = (status: OrderStatus) =>
    orders.value.filter((order) => order.status === status).length;

  return [
    { key: 'all' as const, label: 'Все', count: all },
    {
      key: 'pending' as const,
      label: ORDER_STATUS_COLUMN_LABELS.pending,
      count: byStatus('pending'),
    },
    {
      key: 'processing' as const,
      label: ORDER_STATUS_COLUMN_LABELS.processing,
      count: byStatus('processing'),
    },
    {
      key: 'shipped' as const,
      label: ORDER_STATUS_COLUMN_LABELS.shipped,
      count: byStatus('shipped'),
    },
    {
      key: 'completed' as const,
      label: ORDER_STATUS_COLUMN_LABELS.completed,
      count: byStatus('completed'),
    },
    {
      key: 'cancelled' as const,
      label: ORDER_STATUS_COLUMN_LABELS.cancelled,
      count: byStatus('cancelled'),
    },
  ];
});

const filteredOrders = computed(() => {
  const term = searchQuery.value.trim().toLowerCase();
  return orders.value.filter((order) => {
    if (activeFilter.value !== 'all' && order.status !== activeFilter.value) {
      return false;
    }
    if (!term) {
      return true;
    }
    const haystack = [
      order.number,
      order.customerName,
      order.customerEmail,
      order.customerCompany,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });
});

const selectedOrder = computed(
  () =>
    orders.value.find((order) => order.id === props.selectedOrderId) ?? null,
);

const selectedOrderActions = computed(() =>
  selectedOrder.value && canManage
    ? getInboxStatusActions(selectedOrder.value.status)
    : [],
);

const showMarkPaidAction = computed(
  () =>
    selectedOrder.value &&
    canManage &&
    selectedOrder.value.type === OrderType.purchase &&
    selectedOrder.value.paymentStatus === PaymentStatus.pendingManual,
);

function ensureSelectedOrderVisible() {
  if (!props.selectedOrderId) {
    if (filteredOrders.value[0]) {
      emit('select', filteredOrders.value[0]);
    }
    return;
  }

  const selected = orders.value.find(
    (order) => order.id === props.selectedOrderId,
  );
  if (!selected) {
    if (filteredOrders.value[0]) {
      emit('select', filteredOrders.value[0]);
    }
    return;
  }

  const visible =
    activeFilter.value === 'all' || activeFilter.value === selected.status;
  if (!visible) {
    activeFilter.value = selected.status;
  }

  const inFilteredList = filteredOrders.value.some(
    (order) => order.id === props.selectedOrderId,
  );
  if (!inFilteredList && filteredOrders.value[0]) {
    emit('select', filteredOrders.value[0]);
  }
}

watch(
  [filteredOrders, () => props.selectedOrderId],
  () => {
    ensureSelectedOrderVisible();
  },
  { immediate: true },
);

function filterChipClass(key: ListFilter) {
  if (key === 'all') {
    return activeFilter.value === 'all'
      ? 'bg-neutral-900 text-white ring-neutral-900'
      : 'bg-neutral-100 text-neutral-700 ring-neutral-200 hover:bg-neutral-200';
  }
  const colors = ORDER_STATUS_COLORS[key];
  return activeFilter.value === key
    ? `${colors.dot} text-white ring-transparent`
    : `${colors.bg} ${colors.text} ring-transparent hover:opacity-90`;
}
</script>

<template>
  <div
    class="flex min-h-[560px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
  >
    <div
      class="flex w-full max-w-md shrink-0 flex-col border-r border-neutral-200"
    >
      <div class="space-y-3 border-b border-neutral-200 p-3">
        <SkmInput
          v-model="searchQuery"
          type="search"
          placeholder="Поиск по номеру, клиенту…"
          aria-label="Поиск заказов"
        />
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="filter in filters"
            :key="filter.key"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition"
            :class="filterChipClass(filter.key)"
            @click="activeFilter = filter.key"
          >
            <span
              v-if="filter.key !== 'all'"
              class="size-1.5 shrink-0 rounded-full"
              :class="
                activeFilter === filter.key
                  ? 'bg-white'
                  : ORDER_STATUS_COLORS[filter.key].dot
              "
            />
            {{ filter.label }}
            <span
              class="rounded-full px-1.5 py-0.5 text-[10px]"
              :class="
                activeFilter === filter.key ? 'bg-white/25' : 'bg-black/5'
              "
            >
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>

      <ul
        v-if="filteredOrders.length > 0"
        class="flex-1 divide-y divide-neutral-100 overflow-y-auto"
      >
        <li v-for="order in filteredOrders" :key="order.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-left transition"
            :class="
              selectedOrderId === order.id
                ? 'border-l-4 border-l-accent-500 bg-accent-50/60'
                : 'border-l-4 border-l-transparent hover:bg-neutral-50'
            "
            @click="emit('select', order)"
          >
            <span
              class="size-2.5 shrink-0 rounded-full"
              :class="ORDER_STATUS_COLORS[order.status].dot"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-neutral-950">
                {{ order.number }}
              </p>
              <p class="truncate text-xs text-neutral-500">
                {{ order.customerName }}
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-xs font-semibold text-neutral-800">
                {{ formatOrderTotal(order) }}
              </p>
              <p class="text-[10px] text-neutral-400">
                {{ order.lines.length }} поз.
              </p>
            </div>
          </button>
        </li>
      </ul>

      <div
        v-else
        class="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"
      >
        <UIcon name="i-lucide-inbox" class="mb-3 size-8 text-neutral-300" />
        <p class="text-sm font-medium text-neutral-600">Заказы не найдены</p>
        <p class="mt-1 text-xs text-neutral-400">
          Измените фильтр или поисковый запрос
        </p>
      </div>
    </div>

    <section v-if="selectedOrder" class="flex min-w-0 flex-1 flex-col">
      <header
        class="border-b px-6 py-5"
        :class="ORDER_STATUS_COLORS[selectedOrder.status].bg"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              :class="ORDER_STATUS_COLORS[selectedOrder.status].text"
            >
              {{ ORDER_STATUS_COLUMN_LABELS[selectedOrder.status] }}
            </p>
            <h2
              class="mt-1 text-2xl font-bold"
              :class="ORDER_STATUS_COLORS[selectedOrder.status].text"
            >
              {{ selectedOrder.number }}
            </h2>
            <p
              class="mt-1 text-sm opacity-80"
              :class="ORDER_STATUS_COLORS[selectedOrder.status].text"
            >
              {{ formatOrderDate(selectedOrder.createdAt) }}
            </p>
          </div>
          <SkmOrderStatusBadge :status="selectedOrder.status" />
        </div>
      </header>

      <div class="flex-1 overflow-y-auto px-6 py-5">
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-xl border border-neutral-200 p-4">
            <h3 class="text-xs font-semibold uppercase text-neutral-400">
              Клиент
            </h3>
            <p class="mt-2 text-lg font-semibold text-neutral-950">
              {{ selectedOrder.customerName }}
            </p>
            <p class="text-sm text-neutral-600">
              {{ selectedOrder.customerEmail }}
            </p>
            <p
              v-if="selectedOrder.customerCompany"
              class="mt-1 text-sm text-neutral-500"
            >
              {{ selectedOrder.customerCompany }}
            </p>
          </div>

          <div class="rounded-xl border border-neutral-200 p-4">
            <h3 class="text-xs font-semibold uppercase text-neutral-400">
              Заказ
            </h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="orderTypeBadgeClass(selectedOrder.type)"
              >
                {{ orderTypeLabel(selectedOrder.type) }}
              </span>
              <span
                class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
              >
                {{ paymentStatusLabel(selectedOrder.paymentStatus) }}
              </span>
            </div>
            <p class="mt-3 text-2xl font-bold text-neutral-950">
              {{ formatOrderTotal(selectedOrder) }}
            </p>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="mb-3 text-xs font-semibold uppercase text-neutral-400">
            Позиции ({{ selectedOrder.lines.length }})
          </h3>
          <div class="space-y-2">
            <div
              v-for="line in selectedOrder.lines"
              :key="line.productId"
              class="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3"
            >
              <div>
                <p class="font-medium text-neutral-900">
                  {{ line.title }}
                </p>
                <p class="text-xs text-neutral-500">
                  {{ line.sku }} · {{ line.quantity }} шт.
                </p>
              </div>
              <span class="text-sm font-semibold text-neutral-800">
                {{ line.unitPrice ?? 'по запросу' }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="selectedOrder.customerNote"
          class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <span class="font-semibold">Примечание:</span>
          {{ selectedOrder.customerNote }}
        </div>
      </div>

      <footer
        v-if="selectedOrderActions.length > 0 || showMarkPaidAction"
        class="border-t border-neutral-200 bg-neutral-50 px-6 py-4"
      >
        <p class="mb-2 text-xs font-semibold uppercase text-neutral-400">
          Действия
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="action in selectedOrderActions"
            :key="action.label"
            type="button"
            class="rounded-lg px-3 py-2 text-xs font-semibold text-white transition"
            :class="action.colorClass"
            @click="transitionOrder(selectedOrder!.id, action.target)"
          >
            {{ action.label }}
          </button>
          <button
            v-if="showMarkPaidAction"
            type="button"
            class="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
            @click="markOrderPaid(selectedOrder!.id)"
          >
            Отметить оплаченным
          </button>
        </div>
      </footer>
    </section>

    <div
      v-else
      class="flex flex-1 flex-col items-center justify-center gap-2 text-neutral-400"
    >
      <UIcon name="i-lucide-mouse-pointer-click" class="size-8" />
      <p class="text-sm">Выберите заказ из списка</p>
    </div>
  </div>
</template>

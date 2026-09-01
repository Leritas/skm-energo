<script setup lang="ts">
import type { OrderDto } from '@skm/specs';
import AdminOrdersCreateModal from '~/components/admin/orders/AdminOrdersCreateModal.vue';
import AdminOrdersInboxView from '~/components/admin/orders/AdminOrdersInboxView.vue';
import AdminOrdersKanbanView from '~/components/admin/orders/AdminOrdersKanbanView.vue';
import AdminOrdersKpiBar from '~/components/admin/orders/AdminOrdersKpiBar.vue';
import {
  ADMIN_ORDERS_VIEWS,
  type AdminOrdersView,
} from '~/constants/admin-orders';
import { provideAdminOrdersState } from '~/composables/useAdminOrdersState';

const props = defineProps<{
  canManage: boolean;
}>();

const route = useRoute();
const router = useRouter();

const { stats, findOrder, loading, loadOrders } = provideAdminOrdersState({
  canManage: props.canManage,
});

const viewMode = ref<AdminOrdersView>('kanban');
const selectedOrderId = ref<number | null>(null);
const createOpen = ref(false);

const viewTabItems = ADMIN_ORDERS_VIEWS.map((view) => ({
  label: view.label,
  value: view.value,
}));

function parseViewQuery(raw: unknown): AdminOrdersView {
  const value = typeof raw === 'string' ? raw.toLowerCase() : 'kanban';
  return value === 'inbox' ? 'inbox' : 'kanban';
}

function parseOrderQuery(raw: unknown): number | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && findOrder(id) ? id : null;
}

function syncFromRoute() {
  viewMode.value = parseViewQuery(route.query.view);

  const orderFromQuery = parseOrderQuery(route.query.order);
  if (orderFromQuery !== null) {
    selectedOrderId.value = orderFromQuery;
    return;
  }

  if (selectedOrderId.value === null || !findOrder(selectedOrderId.value)) {
    selectedOrderId.value = null;
  }
}

function replaceRouteQuery(partial: {
  view?: AdminOrdersView;
  order?: number | null;
}) {
  const query = { ...route.query };

  if (partial.view !== undefined) {
    query.view = partial.view;
  }

  if (partial.order !== undefined) {
    if (partial.order === null) {
      delete query.order;
    } else {
      query.order = String(partial.order);
    }
  }

  void router.replace({ query });
}

function selectOrder(order: OrderDto) {
  selectedOrderId.value = order.id;
  replaceRouteQuery({ order: order.id });
}

function openOrderInInbox(order: OrderDto) {
  selectedOrderId.value = order.id;
  viewMode.value = 'inbox';
  replaceRouteQuery({ view: 'inbox', order: order.id });
}

watch(viewMode, (view) => {
  if (parseViewQuery(route.query.view) === view) {
    return;
  }
  replaceRouteQuery({ view });
});

watch(selectedOrderId, (orderId) => {
  const fromRoute = parseOrderQuery(route.query.order);
  if (fromRoute === orderId) {
    return;
  }
  replaceRouteQuery({ order: orderId });
});

watch(
  () => [route.query.view, route.query.order] as const,
  () => {
    syncFromRoute();
  },
);

onMounted(async () => {
  await loadOrders();
  syncFromRoute();
  if (!route.query.view) {
    replaceRouteQuery({ view: viewMode.value });
  }
});
</script>

<template>
  <div class="space-y-6">
    <SkmAlert
      v-if="!canManage"
      tone="neutral"
      title="Только просмотр"
      description="Список и детали заказов доступны для чтения. Для смены статусов и создания заказов нужно право canManageOrders."
      icon="i-lucide-eye"
    />

    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    >
      <SkmPageHeader
        title="Заказы"
        description="Канбан — обзор потока по статусам. Инбокс — детальная работа с заказом. «Открыть» на карточке переключает в инбокс."
        class="!mb-0"
      />
      <div class="flex shrink-0 flex-wrap items-center gap-3 lg:pt-2">
        <SkmTabs
          v-model="viewMode"
          :items="viewTabItems"
          class="min-w-[220px]"
        />
        <SkmButton
          v-if="canManage"
          icon="i-lucide-plus"
          @click="createOpen = true"
        >
          Создать заказ
        </SkmButton>
      </div>
    </div>

    <AdminOrdersKpiBar :stats="stats" />

    <div
      v-if="loading"
      class="rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center text-sm text-neutral-500"
    >
      Загрузка заказов…
    </div>

    <template v-else>
      <AdminOrdersKanbanView
        v-if="viewMode === 'kanban'"
        :selected-order-id="selectedOrderId"
        @select="selectOrder"
        @open="openOrderInInbox"
      />
      <AdminOrdersInboxView
        v-else
        :selected-order-id="selectedOrderId"
        @select="selectOrder"
      />
    </template>

    <AdminOrdersCreateModal v-if="canManage" v-model:open="createOpen" />
  </div>
</template>

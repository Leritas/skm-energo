import type { OrderDto, OrderStatus } from '@skm/specs';
import { PaymentStatus as PaymentStatusEnum } from '@skm/specs';
import {
  computeAdminOrdersKpi,
  ORDER_STATUS_COLUMN_LABELS,
} from '~/constants/admin-orders';

const adminOrdersStateKey = Symbol('adminOrdersState');

export function provideAdminOrdersState(options: { canManage: boolean }) {
  const { listOrders, updateOrder, createOrder } = useOrdersAdmin();
  const toast = useToast();

  const orders = ref<OrderDto[]>([]);
  const loading = ref(false);
  const saving = ref(false);

  const stats = computed(() => computeAdminOrdersKpi(orders.value));

  function findOrder(orderId: number) {
    return orders.value.find((order) => order.id === orderId) ?? null;
  }

  function replaceOrder(updated: OrderDto) {
    const index = orders.value.findIndex((order) => order.id === updated.id);
    if (index >= 0) {
      orders.value[index] = updated;
    } else {
      orders.value.unshift(updated);
    }
  }

  async function loadOrders() {
    loading.value = true;
    try {
      const pageSize = 200;
      let page = 1;
      let total = 0;
      const aggregated: OrderDto[] = [];

      do {
        const response = await listOrders({ page, limit: pageSize });
        aggregated.push(...response.items);
        total = response.total;
        page += 1;
      } while (aggregated.length < total);

      orders.value = aggregated;
    } catch (error) {
      toast.add({
        title: 'Не удалось загрузить заказы',
        description: error instanceof Error ? error.message : undefined,
        color: 'error',
      });
    } finally {
      loading.value = false;
    }
  }

  async function transitionOrder(orderId: number, targetStatus: OrderStatus) {
    if (!options.canManage) {
      return;
    }

    const order = findOrder(orderId);
    if (!order || order.status === targetStatus) {
      return;
    }

    saving.value = true;
    try {
      const updated = await updateOrder(orderId, { status: targetStatus });
      replaceOrder(updated);
      toast.add({
        title: `${updated.number}: ${ORDER_STATUS_COLUMN_LABELS[targetStatus]}`,
        color: 'success',
      });
    } catch (error) {
      toast.add({
        title: 'Не удалось обновить статус',
        description: error instanceof Error ? error.message : undefined,
        color: 'error',
      });
    } finally {
      saving.value = false;
    }
  }

  async function markOrderPaid(orderId: number) {
    if (!options.canManage) {
      return;
    }

    const order = findOrder(orderId);
    if (!order || order.paymentStatus === PaymentStatusEnum.paidManual) {
      return;
    }

    saving.value = true;
    try {
      const updated = await updateOrder(orderId, {
        paymentStatus: PaymentStatusEnum.paidManual,
      });
      replaceOrder(updated);
      toast.add({
        title: `${updated.number}: оплачен`,
        color: 'success',
      });
    } catch (error) {
      toast.add({
        title: 'Не удалось обновить оплату',
        description: error instanceof Error ? error.message : undefined,
        color: 'error',
      });
    } finally {
      saving.value = false;
    }
  }

  async function submitCreateOrder(
    body: Parameters<typeof createOrder>[0],
  ): Promise<OrderDto | null> {
    if (!options.canManage) {
      return null;
    }

    saving.value = true;
    try {
      const created = await createOrder(body);
      replaceOrder(created);
      toast.add({
        title: `Заказ ${created.number} создан`,
        color: 'success',
      });
      return created;
    } catch (error) {
      toast.add({
        title: 'Не удалось создать заказ',
        description: error instanceof Error ? error.message : undefined,
        color: 'error',
      });
      return null;
    } finally {
      saving.value = false;
    }
  }

  const state = {
    orders,
    loading,
    saving,
    stats,
    canManage: options.canManage,
    findOrder,
    loadOrders,
    transitionOrder,
    markOrderPaid,
    submitCreateOrder,
  };

  provide(adminOrdersStateKey, state);
  return state;
}

export function useAdminOrdersState() {
  const state = inject(adminOrdersStateKey);
  if (!state) {
    throw new Error('useAdminOrdersState must be used within provider');
  }
  return state;
}

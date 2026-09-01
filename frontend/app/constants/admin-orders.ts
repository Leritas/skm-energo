import {
  OrderType,
  PaymentStatus,
  type OrderDto,
  type OrderStatus,
  type OrderType as OrderTypeValue,
} from '@skm/specs';

export type AdminOrdersView = 'kanban' | 'inbox';

export const ADMIN_ORDERS_VIEWS = [
  { value: 'kanban' as const, label: 'Канбан' },
  { value: 'inbox' as const, label: 'Инбокс' },
] as const;

export type AdminOrdersKpi = {
  pending: number;
  processing: number;
  shipped: number;
  total: number;
  paidRevenueLabel: string;
};

export const ORDER_STATUS_COLUMN_LABELS: Record<OrderStatus, string> = {
  pending: 'Ожидает',
  processing: 'В работе',
  shipped: 'Отправлен',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  pending: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  processing: {
    bg: 'bg-accent-50',
    border: 'border-accent-200',
    text: 'text-accent-800',
    dot: 'bg-accent-500',
  },
  shipped: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    dot: 'bg-sky-500',
  },
  completed: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
};

export function orderTypeLabel(type: OrderTypeValue): string {
  switch (type) {
    case OrderType.purchase:
      return 'Покупка';
    case OrderType.requestProducts:
      return 'Запрос';
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.pendingManual:
      return 'Ожидает оплаты';
    case PaymentStatus.paidManual:
      return 'Оплачен';
    case PaymentStatus.notRequired:
      return 'Не требуется';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function formatOrderDate(isoDate: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

export function formatOrderTotal(order: OrderDto): string {
  if (order.type === OrderType.requestProducts) {
    return 'по запросу';
  }

  const total = order.lines.reduce((sum, line) => {
    if (!line.unitPrice) {
      return sum;
    }
    const unit = Number.parseFloat(line.unitPrice);
    if (!Number.isFinite(unit)) {
      return sum;
    }
    return sum + unit * line.quantity;
  }, 0);

  return total > 0 ? `${total.toLocaleString('ru-RU')} ₽` : 'по запросу';
}

export function computeAdminOrdersKpi(
  orders: readonly OrderDto[],
): AdminOrdersKpi {
  const pending = orders.filter((order) => order.status === 'pending').length;
  const processing = orders.filter(
    (order) => order.status === 'processing',
  ).length;
  const shipped = orders.filter((order) => order.status === 'shipped').length;

  const paidTotal = orders
    .filter((order) => order.paymentStatus === PaymentStatus.paidManual)
    .reduce((sum, order) => {
      if (order.type === OrderType.requestProducts) {
        return sum;
      }
      return (
        sum +
        order.lines.reduce((lineSum, line) => {
          if (!line.unitPrice) {
            return lineSum;
          }
          const unit = Number.parseFloat(line.unitPrice);
          if (!Number.isFinite(unit)) {
            return lineSum;
          }
          return lineSum + unit * line.quantity;
        }, 0)
      );
    }, 0);

  return {
    pending,
    processing,
    shipped,
    total: orders.length,
    paidRevenueLabel:
      paidTotal > 0 ? `${paidTotal.toLocaleString('ru-RU')} ₽` : '—',
  };
}

export function orderTypeBadgeClass(type: OrderTypeValue): string {
  return type === OrderType.purchase
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-brand-purple-100 text-brand-purple-700';
}

export type AdminOrdersStatusAction = {
  label: string;
  target: OrderStatus;
  colorClass: string;
};

export function getPrimaryStatusTransition(
  status: OrderStatus,
): AdminOrdersStatusAction | null {
  switch (status) {
    case 'pending':
      return {
        label: 'В работу',
        target: 'processing',
        colorClass: 'bg-accent-500 hover:bg-accent-600',
      };
    case 'processing':
      return {
        label: 'Отправить',
        target: 'shipped',
        colorClass: 'bg-sky-500 hover:bg-sky-600',
      };
    case 'shipped':
      return {
        label: 'Завершить',
        target: 'completed',
        colorClass: 'bg-emerald-500 hover:bg-emerald-600',
      };
    default:
      return null;
  }
}

export function getInboxStatusActions(
  status: OrderStatus,
): AdminOrdersStatusAction[] {
  const actions: AdminOrdersStatusAction[] = [];
  const primary = getPrimaryStatusTransition(status);
  if (primary) {
    actions.push(primary);
  }
  if (status !== 'cancelled' && status !== 'completed') {
    actions.push({
      label: 'Отменить',
      target: 'cancelled',
      colorClass: 'bg-red-500 hover:bg-red-600',
    });
  }
  return actions;
}

export function getKanbanTransitionButtonClass(
  targetStatus: OrderStatus,
): string {
  switch (targetStatus) {
    case 'processing':
      return 'bg-accent-500 hover:bg-accent-600';
    case 'shipped':
      return 'bg-sky-500 hover:bg-sky-600';
    case 'completed':
      return 'bg-emerald-500 hover:bg-emerald-600';
    default:
      return 'bg-neutral-500 hover:bg-neutral-600';
  }
}

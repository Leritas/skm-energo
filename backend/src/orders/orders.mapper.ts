import {
  CustomerType as SpecCustomerType,
  OrderType as SpecOrderType,
  PaymentStatus as SpecPaymentStatus,
  type OrderDto,
  type OrderLineDto,
} from '@skm/specs';
import {
  CustomerType,
  OrderType,
  PaymentStatus,
  type Order,
  type OrderLine,
  type Product,
} from '@prisma/client';

type OrderWithLines = Order & {
  lines: (OrderLine & { product: Product })[];
};

export function toPrismaPaymentStatus(status: SpecPaymentStatus): PaymentStatus {
  switch (status) {
    case SpecPaymentStatus.pendingManual:
      return PaymentStatus.pending_manual;
    case SpecPaymentStatus.paidManual:
      return PaymentStatus.paid_manual;
    case SpecPaymentStatus.notRequired:
      return PaymentStatus.not_required;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function formatOrderNumber(id: number): string {
  return `SKM-${id}`;
}

export function toSpecOrderType(type: OrderType): SpecOrderType {
  switch (type) {
    case OrderType.purchase:
      return SpecOrderType.purchase;
    case OrderType.request_products:
      return SpecOrderType.requestProducts;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function toPrismaOrderType(type: SpecOrderType): OrderType {
  switch (type) {
    case SpecOrderType.purchase:
      return OrderType.purchase;
    case SpecOrderType.requestProducts:
      return OrderType.request_products;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function toSpecPaymentStatus(
  status: PaymentStatus,
): SpecPaymentStatus {
  switch (status) {
    case PaymentStatus.pending_manual:
      return SpecPaymentStatus.pendingManual;
    case PaymentStatus.paid_manual:
      return SpecPaymentStatus.paidManual;
    case PaymentStatus.not_required:
      return SpecPaymentStatus.notRequired;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function toSpecCustomerType(type: CustomerType): SpecCustomerType {
  switch (type) {
    case CustomerType.individual:
      return SpecCustomerType.individual;
    case CustomerType.legal_entity:
      return SpecCustomerType.legalEntity;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function toPrismaCustomerType(type: SpecCustomerType): CustomerType {
  switch (type) {
    case SpecCustomerType.individual:
      return CustomerType.individual;
    case SpecCustomerType.legalEntity:
      return CustomerType.legal_entity;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function toOrderLineDto(
  line: OrderLine & { product: Product },
): OrderLineDto {
  return {
    productId: line.productId,
    quantity: line.quantity,
    unitPrice: line.unitPrice?.toString() ?? null,
    title: line.product.title,
    sku: line.product.sku,
  };
}

export function toOrderDto(order: OrderWithLines): OrderDto {
  return {
    id: order.id,
    number: formatOrderNumber(order.id),
    type: toSpecOrderType(order.type),
    status: order.status,
    paymentStatus: toSpecPaymentStatus(order.paymentStatus),
    customerType: toSpecCustomerType(order.customerType),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerCompany: order.customerCompany,
    customerInn: order.customerInn,
    customerPosition: order.customerPosition,
    customerNote: order.customerNote,
    lines: order.lines.map(toOrderLineDto),
    createdAt: order.createdAt.toISOString(),
  };
}

export function deriveOrderTypeFromLines(
  lines: Array<{ unitPrice: string | null }>,
): SpecOrderType {
  const allPriced =
    lines.length > 0 && lines.every((line) => line.unitPrice !== null);
  return allPriced ? SpecOrderType.purchase : SpecOrderType.requestProducts;
}

export function derivePaymentStatus(type: SpecOrderType): SpecPaymentStatus {
  return type === SpecOrderType.purchase
    ? SpecPaymentStatus.pendingManual
    : SpecPaymentStatus.notRequired;
}

export function orderTypeLabel(type: SpecOrderType): string {
  return type === SpecOrderType.purchase
    ? 'Заказ с ценами'
    : 'Запрос на поставку';
}

export function paymentStatusLabel(status: SpecPaymentStatus): string {
  switch (status) {
    case SpecPaymentStatus.pendingManual:
      return 'Оплата — вручную после согласования';
    case SpecPaymentStatus.paidManual:
      return 'Оплата получена';
    case SpecPaymentStatus.notRequired:
      return 'Оплата не требуется';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

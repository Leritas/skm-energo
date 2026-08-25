import type { AttachedFile } from './media';

export const OrderType = {
  purchase: 'purchase',
  requestProducts: 'request-products',
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const OrderStatus = {
  pending: 'pending',
  processing: 'processing',
  shipped: 'shipped',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  pendingManual: 'pending_manual',
  paidManual: 'paid_manual',
  notRequired: 'not_required',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const CustomerType = {
  individual: 'individual',
  legalEntity: 'legal_entity',
} as const;

export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];

export interface CartLineDto {
  productId: number;
  quantity: number;
  title: string;
  slug: string;
  sku: string;
  price: string | null;
  photo: AttachedFile | null;
  isAvailable: boolean;
}

export interface CartDto {
  items: CartLineDto[];
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface OrderLineDto {
  productId: number;
  quantity: number;
  unitPrice: string | null;
  title: string;
  sku: string;
}

export interface OrderDto {
  id: number;
  number: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerType: CustomerType;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerCompany: string | null;
  customerInn: string | null;
  customerPosition: string | null;
  customerNote: string | null;
  lines: OrderLineDto[];
  createdAt: string;
}

export interface CreateOrderRequest {
  customerType: CustomerType;
  name: string;
  phone: string;
  company?: string | null;
  inn?: string | null;
  position?: string | null;
  customerNote?: string | null;
}

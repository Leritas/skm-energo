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

import type { CartLineDto } from '@skm/specs';
import { cartHasPricedItems } from '~/utils/cart';

export type CheckoutOrderPreview = {
  orderType: 'purchase' | 'request-products';
  orderTypeLabel: string;
  paymentStatus: 'pending_manual' | 'not_required';
  paymentStatusLabel: string;
  allLinesPriced: boolean;
  hasPricedLines: boolean;
  hasUnavailable: boolean;
};

function lineHasPrice(price: string | null): boolean {
  if (!price) {
    return false;
  }
  return !Number.isNaN(Number.parseFloat(price));
}

export function deriveCheckoutOrderPreview(
  items: CartLineDto[],
): CheckoutOrderPreview {
  const availableItems = items.filter((item) => item.isAvailable);
  const allLinesPriced =
    availableItems.length > 0 &&
    availableItems.every((item) => lineHasPrice(item.price));
  const orderType = allLinesPriced ? 'purchase' : 'request-products';

  return {
    orderType,
    orderTypeLabel:
      orderType === 'purchase' ? 'Заказ с ценами' : 'Запрос на поставку',
    paymentStatus: orderType === 'purchase' ? 'pending_manual' : 'not_required',
    paymentStatusLabel:
      orderType === 'purchase'
        ? 'Оплата — вручную после согласования'
        : 'Оплата не требуется',
    allLinesPriced,
    hasPricedLines: cartHasPricedItems(availableItems),
    hasUnavailable: items.some((item) => !item.isAvailable),
  };
}

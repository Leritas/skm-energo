const POZICIYA_FORMS: [string, string, string] = [
  'позиция',
  'позиции',
  'позиций',
];

export const CART_PRICE_ON_REQUEST_LABEL = 'Цена по запросу';

export function pluralRu(
  count: number,
  forms: [string, string, string],
): string {
  const n = Math.abs(count);
  if (n % 10 === 1 && n % 100 !== 11) {
    return forms[0];
  }
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
    return forms[1];
  }
  return forms[2];
}

export function cartPositionsLabel(count: number): string {
  return pluralRu(count, POZICIYA_FORMS);
}

export function formatCartPriceLabel(price: string | null): string {
  if (!price) {
    return CART_PRICE_ON_REQUEST_LABEL;
  }

  const numeric = Number.parseFloat(price);
  if (Number.isNaN(numeric)) {
    return CART_PRICE_ON_REQUEST_LABEL;
  }

  return `${numeric.toLocaleString('ru-RU')} ₽`;
}

export function cartHasPricedItems(
  items: Array<{ price: string | null }>,
): boolean {
  return items.some((item) => hasValidCartPrice(item.price));
}

function hasValidCartPrice(price: string | null): boolean {
  if (!price) {
    return false;
  }

  return !Number.isNaN(Number.parseFloat(price));
}

export function formatCartTotalLabel(
  items: Array<{ price: string | null; quantity: number }>,
): string {
  if (!cartHasPricedItems(items)) {
    return CART_PRICE_ON_REQUEST_LABEL;
  }

  const total = items.reduce((sum, item) => {
    if (!hasValidCartPrice(item.price)) {
      return sum;
    }
    const unit = Number.parseFloat(item.price!);
    return sum + unit * item.quantity;
  }, 0);

  const formattedTotal = `${total.toLocaleString('ru-RU')} ₽`;
  const allItemsPriced = items.every((item) => hasValidCartPrice(item.price));

  return allItemsPriced ? formattedTotal : `от ${formattedTotal}`;
}

const POZICIYA_FORMS: [string, string, string] = [
  'позиция',
  'позиции',
  'позиций',
];

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
    return 'По запросу';
  }

  const numeric = Number.parseFloat(price);
  if (Number.isNaN(numeric)) {
    return 'По запросу';
  }

  return `${numeric.toLocaleString('ru-RU')} ₽`;
}

export function cartHasPricedItems(
  items: Array<{ price: string | null }>,
): boolean {
  return items.some((item) => item.price != null);
}

export function formatCartTotalLabel(
  items: Array<{ price: string | null; quantity: number }>,
): string {
  if (!cartHasPricedItems(items)) {
    return 'По запросу';
  }

  const total = items.reduce((sum, item) => {
    if (!item.price) {
      return sum;
    }
    const unit = Number.parseFloat(item.price);
    if (Number.isNaN(unit)) {
      return sum;
    }
    return sum + unit * item.quantity;
  }, 0);

  return `${total.toLocaleString('ru-RU')} ₽`;
}

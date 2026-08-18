export interface CatalogSpecItem {
  label: string;
  value: string;
}

export function parseProductSpecs(value: unknown): CatalogSpecItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === 'object' &&
      item !== null &&
      'label' in item &&
      'value' in item &&
      typeof item.label === 'string' &&
      typeof item.value === 'string'
    ) {
      return [{ label: item.label, value: item.value }];
    }
    return [];
  });
}

export function normalizeProductSpecs(
  specs: CatalogSpecItem[] | undefined,
): CatalogSpecItem[] {
  if (!specs) {
    return [];
  }

  return specs
    .map((spec) => ({
      label: spec.label.trim(),
      value: spec.value.trim(),
    }))
    .filter((spec) => spec.label.length > 0 && spec.value.length > 0);
}

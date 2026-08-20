import type { CatalogProductDetail } from '~/types/catalog';

export function resolveProductSeoTitle(product: {
  title: string;
  seoTitle: string | null;
}): string {
  const custom = product.seoTitle?.trim();
  return custom && custom.length > 0 ? custom : product.title;
}

export function resolveProductSeoDescription(product: {
  description: string;
  seoDescription: string | null;
}): string {
  const custom = product.seoDescription?.trim();
  return custom && custom.length > 0 ? custom : product.description;
}

export function formatProductDocumentTitle(
  title: string,
  siteName: string,
): string {
  return `${title} — ${siteName}`;
}

export function buildProductJsonLd(input: {
  product: CatalogProductDetail;
  manufacturerLabel: string;
  categoryLabel: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.product.title,
    description: resolveProductSeoDescription(input.product),
    sku: input.product.sku,
    url: input.url,
    brand: {
      '@type': 'Brand',
      name: input.manufacturerLabel,
    },
    category: input.categoryLabel,
  };
}

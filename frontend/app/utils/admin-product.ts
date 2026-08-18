import type { AdminProductDto } from '@skm/specs';
import type { CatalogProductDetail, ProductBadge } from '~/types/catalog';

export function adminProductToCatalogDetail(
  product: AdminProductDto,
): CatalogProductDetail {
  return {
    slug: product.slug,
    title: product.title,
    sku: product.sku,
    description: product.description,
    specs: product.specs,
    pdfHref: product.pdfHref,
    badges: product.badges.filter(
      (badge): badge is ProductBadge =>
        badge === 'pdf' || badge === 'new' || badge === 'onRequest',
    ),
    manufacturerSlug: product.manufacturerSlug,
    categorySlug: product.categorySlug,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };
}

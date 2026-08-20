import type { AdminProductDto } from '@skm/specs';
import type { CatalogProductDetail, ProductBadge } from '~/types/catalog';
import { derivePublicProductBadges } from '~/utils/product-badges';

export function adminProductToCatalogDetail(
  product: AdminProductDto,
): CatalogProductDetail {
  const badges = derivePublicProductBadges(
    product.badges,
    product.documents.length > 0,
  ).filter(
    (badge): badge is ProductBadge =>
      badge === 'pdf' || badge === 'new' || badge === 'onRequest',
  );

  return {
    slug: product.slug,
    title: product.title,
    sku: product.sku,
    description: product.description,
    specs: product.specs,
    photos: product.photos,
    documents: product.documents,
    image: product.photos[0] ?? null,
    badges,
    manufacturerSlug: product.manufacturerSlug,
    categorySlug: product.categorySlug,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };
}

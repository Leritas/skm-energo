<script setup lang="ts">
import { getManufacturerLabel } from '~/utils/catalog';
import { SITE } from '~/constants/site';
import {
  buildProductJsonLd,
  formatProductDocumentTitle,
  resolveProductSeoDescription,
  resolveProductSeoTitle,
} from '~/utils/product-seo';

const route = useRoute();
const config = useRuntimeConfig();
const slug = computed(() => String(route.params.slug ?? ''));

const { data: product, error: productError } = await useCatalogProduct(slug);
const { data: manufacturers } = await useCatalogManufacturers();
const { breadcrumbs: categoryBreadcrumbs } = await useCatalogTaxonomy(
  computed(() => null),
  computed(() => product.value?.categorySlug ?? null),
);

if (productError.value) {
  throw createError({
    statusCode: productError.value.statusCode === 404 ? 404 : 500,
    statusMessage:
      productError.value.statusCode === 404
        ? 'Товар не найден'
        : 'Не удалось загрузить товар',
  });
}

const { data: similarProducts } = await useCatalogSimilarProducts(slug);

function manufacturerLabel(manufacturerSlug: string) {
  return getManufacturerLabel(manufacturerSlug, manufacturers.value);
}

const seoTitle = computed(() =>
  formatProductDocumentTitle(resolveProductSeoTitle(product.value!), SITE.name),
);
const seoDescription = computed(() =>
  resolveProductSeoDescription(product.value!),
);
const canonicalUrl = computed(
  () => `${config.public.siteUrl}/product/${product.value!.slug}`,
);
const categoryLabel = computed(() => {
  const trail = categoryBreadcrumbs.value;
  return trail[trail.length - 1]?.label ?? product.value!.categorySlug;
});

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

const jsonLd = computed(() =>
  JSON.stringify(
    buildProductJsonLd({
      product: product.value!,
      manufacturerLabel: manufacturerLabel(product.value!.manufacturerSlug),
      categoryLabel: categoryLabel.value,
      url: canonicalUrl.value,
    }),
  ),
);

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      key: 'product-jsonld',
      type: 'application/ld+json',
      innerHTML: jsonLd,
    },
  ],
});

const breadcrumbs = computed(() => {
  const item = product.value!;
  return [...categoryBreadcrumbs.value, { label: item.title }];
});
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmCatalogProductDetailView
        :product="product!"
        :manufacturer-label="manufacturerLabel(product!.manufacturerSlug)"
        :breadcrumbs="breadcrumbs"
        :similar-products="similarProducts ?? []"
        :similar-manufacturer-label="manufacturerLabel"
      />
    </SkmContainer>
  </SkmSection>
</template>

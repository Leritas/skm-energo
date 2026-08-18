<script setup lang="ts">
import type { CatalogProductListItem } from '~/types/catalog';
import { adminProductToCatalogDetail } from '~/utils/admin-product';
import { getManufacturerLabel } from '~/utils/catalog';
import {
  formatProductDocumentTitle,
  resolveProductSeoDescription,
  resolveProductSeoTitle,
} from '~/utils/product-seo';
import { SITE } from '~/constants/site';

definePageMeta({
  middleware: ['admin-section'],
  adminSection: 'catalog',
  ssr: false,
});

const route = useRoute();
const { getProduct } = useProductsAdmin();

const id = computed(() => Number(route.params.id));

const { data: adminProduct, error: productError } = await useAsyncData(
  () => `admin-product-preview-${id.value}`,
  () => getProduct(id.value),
  { watch: [id] },
);

if (productError.value || !adminProduct.value) {
  throw createError({
    statusCode: productError.value?.statusCode === 404 ? 404 : 500,
    statusMessage:
      productError.value?.statusCode === 404
        ? 'Товар не найден'
        : 'Не удалось загрузить товар',
  });
}

const product = computed(() =>
  adminProductToCatalogDetail(adminProduct.value!),
);

const { api } = useApi();
const { data: manufacturers } = await useCatalogManufacturers();
const { data: similarProducts } = await useAsyncData(
  () => `admin-product-similar-${adminProduct.value?.slug ?? id.value}`,
  async () => {
    const row = adminProduct.value;
    if (!row?.isPublished || row.deletedAt) {
      return [] as CatalogProductListItem[];
    }
    return api<CatalogProductListItem[]>(
      `/catalog/products/${row.slug}/similar`,
      { auth: false },
    );
  },
);

function similarManufacturerLabel(manufacturerSlug: string) {
  return getManufacturerLabel(manufacturerSlug, manufacturers.value);
}

const banner = computed(() => {
  const row = adminProduct.value!;
  if (row.deletedAt) {
    return {
      title: 'Товар в архиве',
      description:
        'Публичная страница недоступна. Восстановите товар, чтобы снова показать его в каталоге.',
    };
  }
  if (!row.isPublished) {
    return {
      title: 'Черновик — только для сотрудников',
      description:
        'Эта страница видна только в админке. Пока товар не опубликован, /product/' +
        row.slug +
        ' отдаёт 404.',
    };
  }
  return {
    title: 'Предпросмотр опубликованного товара',
    description: 'Так страница выглядит для посетителей каталога.',
  };
});

useSeoMeta({
  title: () =>
    `Предпросмотр: ${formatProductDocumentTitle(
      resolveProductSeoTitle(product.value),
      SITE.name,
    )}`,
  description: () => resolveProductSeoDescription(product.value),
  robots: 'noindex, nofollow',
});

const breadcrumbs = computed(() => [
  { label: 'Каталог', to: '/admin/catalog' },
  { label: adminProduct.value!.categoryName },
  { label: product.value.title },
]);
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <SkmButton
        variant="ghost"
        size="sm"
        icon="i-lucide-arrow-left"
        to="/admin/catalog"
      >
        К списку
      </SkmButton>
      <SkmButton
        v-if="adminProduct!.isPublished && !adminProduct!.deletedAt"
        variant="outline"
        size="sm"
        :to="`/product/${adminProduct!.slug}`"
      >
        Открыть публичную страницу
      </SkmButton>
    </div>

    <SkmAlert
      :tone="
        adminProduct!.deletedAt || !adminProduct!.isPublished
          ? 'warning'
          : 'neutral'
      "
      :title="banner.title"
      :description="banner.description"
      icon="i-lucide-eye"
    />

    <div
      class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
    >
      <CatalogProductDetailView
        :product="product"
        :manufacturer-label="adminProduct!.manufacturerName"
        :breadcrumbs="breadcrumbs"
        :similar-products="similarProducts ?? []"
        :similar-manufacturer-label="similarManufacturerLabel"
      />
    </div>
  </div>
</template>

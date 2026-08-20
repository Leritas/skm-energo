<script setup lang="ts">
import { ref } from 'vue';
import type { PrototypeCatalogCategoryVariantProps } from './types';

const props = defineProps<PrototypeCatalogCategoryVariantProps>();

const activeSubcategory = ref<string | null>(
  props.data.subcategories[0]?.slug ?? null,
);

const filteredProducts = computed(() => {
  if (!activeSubcategory.value) {
    return props.data.products;
  }
  return props.data.products.filter(
    (product) => product.subcategorySlug === activeSubcategory.value,
  );
});

const activeLabel = computed(
  () =>
    props.data.subcategories.find(
      (item) => item.slug === activeSubcategory.value,
    )?.label ?? '',
);
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader :title="data.title" :description="data.description">
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="data.breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div class="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <h2
            class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900"
          >
            Подкатегории
          </h2>
          <nav class="flex flex-col border-l border-neutral-200">
            <button
              v-for="subcategory in data.subcategories"
              :key="subcategory.slug"
              type="button"
              class="-ml-px border-l-2 py-2 pl-4 pr-2 text-left text-sm transition"
              :class="
                activeSubcategory === subcategory.slug
                  ? 'border-accent-600 font-semibold text-accent-700'
                  : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
              "
              @click="activeSubcategory = subcategory.slug"
            >
              {{ subcategory.label }}
            </button>
          </nav>
        </aside>

        <div>
          <h2
            class="text-sm font-semibold uppercase tracking-wide text-neutral-900"
          >
            {{ activeLabel }}
            <span class="ml-2 font-normal normal-case text-neutral-500">
              ({{ filteredProducts.length }})
            </span>
          </h2>
          <div class="mt-4 grid gap-6 sm:grid-cols-2">
            <PrototypeProductTile
              v-for="product in filteredProducts"
              :key="product.slug"
              :title="product.title"
              :manufacturer="product.manufacturer"
              :sku="product.sku"
              :badges="product.badges"
              :image-url="product.imageUrl"
            />
          </div>
          <SkmEmpty
            v-if="!filteredProducts.length"
            title="Нет товаров"
            description="В выбранной подкатегории пока нет позиций."
            class="mt-4"
          />
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

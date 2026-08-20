<script setup lang="ts">
import type { PrototypeCatalogCategoryVariantProps } from './types';

defineProps<PrototypeCatalogCategoryVariantProps>();
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader :title="data.title" :description="data.description">
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="data.breadcrumbs" />
        </template>
      </SkmPageHeader>

      <section v-if="data.subcategories.length" class="mt-10">
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-neutral-900"
        >
          Подкатегории
        </h2>
        <div class="mt-4 grid gap-6 lg:grid-cols-2">
          <PrototypeCategoryTile
            v-for="subcategory in data.subcategories"
            :key="subcategory.slug"
            :title="subcategory.label"
            :cover-url="subcategory.coverUrl"
            wide
          />
        </div>
      </section>

      <section v-if="data.products.length" class="mt-12">
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-neutral-900"
        >
          Товары
        </h2>
        <div class="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <PrototypeProductTile
            v-for="product in data.products"
            :key="product.slug"
            :title="product.title"
            :manufacturer="product.manufacturer"
            :sku="product.sku"
            :badges="product.badges"
            :image-url="product.imageUrl"
          />
        </div>
      </section>
    </SkmContainer>
  </SkmSection>
</template>

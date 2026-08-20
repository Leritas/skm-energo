<script setup lang="ts">
import { ref } from 'vue';
import type { PrototypeCatalogCategoryVariantProps } from './types';

const props = defineProps<PrototypeCatalogCategoryVariantProps>();

const activeSubcategory = ref<string | 'all'>('all');

const filteredProducts = computed(() => {
  if (activeSubcategory.value === 'all') {
    return props.data.products;
  }
  return props.data.products.filter(
    (product) => product.subcategorySlug === activeSubcategory.value,
  );
});

const activeSubcategoryData = computed(() =>
  activeSubcategory.value === 'all'
    ? null
    : props.data.subcategories.find(
        (item) => item.slug === activeSubcategory.value,
      ),
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

      <div class="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <h2
            class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900"
          >
            Подкатегории
          </h2>
          <nav class="flex flex-col gap-1">
            <button
              type="button"
              class="rounded-lg px-3 py-2.5 text-left text-sm transition"
              :class="
                activeSubcategory === 'all'
                  ? 'bg-accent-50 font-semibold text-accent-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              "
              @click="activeSubcategory = 'all'"
            >
              Все товары раздела
            </button>
            <button
              v-for="subcategory in data.subcategories"
              :key="subcategory.slug"
              type="button"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition"
              :class="
                activeSubcategory === subcategory.slug
                  ? 'bg-accent-50 font-semibold text-accent-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              "
              @click="activeSubcategory = subcategory.slug"
            >
              <span
                class="size-10 shrink-0 overflow-hidden rounded-md bg-neutral-100"
              >
                <img
                  v-if="subcategory.coverUrl"
                  :src="subcategory.coverUrl"
                  :alt="subcategory.label"
                  class="size-full object-cover"
                />
                <span
                  v-else
                  class="flex size-full items-center justify-center text-neutral-300"
                >
                  <UIcon name="i-lucide-layers" class="size-3.5" />
                </span>
              </span>
              <span>{{ subcategory.label }}</span>
            </button>
          </nav>
        </aside>

        <div>
          <div
            v-if="activeSubcategoryData?.coverUrl"
            class="mb-6 overflow-hidden rounded-xl"
          >
            <img
              :src="activeSubcategoryData.coverUrl"
              :alt="activeSubcategoryData.label"
              class="aspect-[21/9] w-full object-cover"
            />
          </div>

          <h2
            class="text-sm font-semibold uppercase tracking-wide text-neutral-900"
          >
            {{
              activeSubcategory === 'all'
                ? 'Все товары'
                : (activeSubcategoryData?.label ?? 'Товары')
            }}
            <span class="ml-2 font-normal normal-case text-neutral-500">
              ({{ filteredProducts.length }})
            </span>
          </h2>
          <div class="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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

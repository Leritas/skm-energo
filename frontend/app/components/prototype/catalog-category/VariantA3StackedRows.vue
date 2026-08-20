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
        <div class="mt-4 flex flex-col gap-3">
          <article
            v-for="subcategory in data.subcategories"
            :key="subcategory.slug"
            class="group flex overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div class="aspect-[4/3] w-40 shrink-0 bg-neutral-100 sm:w-52">
              <img
                v-if="subcategory.coverUrl"
                :src="subcategory.coverUrl"
                :alt="subcategory.label"
                class="size-full object-cover"
              />
              <div
                v-else
                class="flex size-full items-center justify-center text-neutral-300"
              >
                <UIcon name="i-lucide-layers" class="size-8" />
              </div>
            </div>
            <div
              class="flex min-w-0 flex-1 items-center justify-between gap-4 p-5"
            >
              <h3
                class="text-lg font-semibold text-neutral-950 group-hover:text-accent-600"
              >
                {{ subcategory.label }}
              </h3>
              <span
                class="hidden shrink-0 text-sm font-medium text-accent-600 sm:inline"
              >
                Перейти →
              </span>
            </div>
          </article>
        </div>
      </section>

      <section v-if="data.products.length" class="mt-12">
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-neutral-900"
        >
          Товары
        </h2>
        <div class="mt-4 flex flex-col gap-3">
          <article
            v-for="product in data.products"
            :key="product.slug"
            class="flex gap-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div class="w-24 shrink-0 sm:w-28">
              <SkmProductMedia
                :src="product.imageUrl"
                :alt="product.title"
                aspect="1/1"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="text-xs font-medium uppercase tracking-wide text-accent-600"
              >
                {{ product.manufacturer }}
              </p>
              <h3 class="mt-0.5 text-base font-semibold text-neutral-950">
                {{ product.title }}
              </h3>
              <p class="mt-1 text-xs text-neutral-500">
                Артикул: {{ product.sku }}
              </p>
            </div>
            <div class="hidden shrink-0 items-center sm:flex">
              <span class="text-sm font-medium text-accent-600"
                >Подробнее →</span
              >
            </div>
          </article>
        </div>
      </section>
    </SkmContainer>
  </SkmSection>
</template>

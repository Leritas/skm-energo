<script setup lang="ts">
import type { CatalogCategory } from '~/types/catalog';
import { buildCatalogUrl } from '~/utils/catalog';

defineProps<{
  items: CatalogCategory[];
  manufacturerSlug?: string | null;
  activeCategorySlug?: string | null;
}>();
</script>

<template>
  <nav aria-label="Категории каталога" class="space-y-1">
    <div v-for="item in items" :key="item.slug" class="py-1">
      <NuxtLink
        :to="buildCatalogUrl(item.slug, manufacturerSlug)"
        class="block rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-neutral-50 hover:text-accent-600"
        :class="
          activeCategorySlug === item.slug
            ? 'bg-neutral-50 text-accent-600'
            : 'text-neutral-900'
        "
      >
        {{ item.label }}
      </NuxtLink>
      <ul
        v-if="item.children?.length"
        class="mt-1 space-y-0.5 border-l border-neutral-200 pl-3"
      >
        <li v-for="child in item.children" :key="child.slug">
          <NuxtLink
            :to="buildCatalogUrl(child.slug, manufacturerSlug)"
            class="block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 hover:text-accent-600"
            :class="
              activeCategorySlug === child.slug
                ? 'text-accent-600'
                : 'text-neutral-600'
            "
          >
            {{ child.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

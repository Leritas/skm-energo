<script setup lang="ts">
import { buildCatalogUrl, parseManufacturerQuery } from '~/utils/catalog';

const open = ref(false);
const route = useRoute();
const { data: manufacturers } = await useCatalogManufacturers();

const manufacturerSlug = computed(() =>
  parseManufacturerQuery(route.query.manufacturer, manufacturers.value),
);

const { tree: visibleCategories } = await useCatalogTaxonomy(manufacturerSlug);

function isManufacturerActive(slug: string) {
  return manufacturerSlug.value === slug;
}

function manufacturerUrl(slug: string) {
  return buildCatalogUrl(null, isManufacturerActive(slug) ? null : slug);
}

function closeMenu() {
  open.value = false;
}
</script>

<template>
  <SkmPopover v-model:open="open" variant="catalog">
    <button
      type="button"
      class="flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors hover:text-accent-600"
      :class="{ 'text-accent-600': open }"
    >
      Продукция
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <template #content>
      <div class="w-[22rem] py-3">
        <div class="border-b border-neutral-100 px-4 pb-3">
          <p
            class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500"
          >
            Производители
          </p>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="manufacturer in manufacturers ?? []"
              :key="manufacturer.slug"
              :to="manufacturerUrl(manufacturer.slug)"
              class="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              @click="closeMenu"
            >
              <SkmBadge
                :label="manufacturer.label"
                :tone="
                  isManufacturerActive(manufacturer.slug) ? 'accent' : 'neutral'
                "
                size="sm"
              />
            </NuxtLink>
          </div>
        </div>

        <div class="max-h-80 overflow-y-auto px-2 pt-3">
          <NuxtLink
            to="/catalog"
            class="block rounded-md px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-brand-purple-50 hover:text-accent-600"
            @click="closeMenu"
          >
            Весь каталог
          </NuxtLink>
          <div
            v-for="category in visibleCategories ?? []"
            :key="category.slug"
            class="border-b border-neutral-100 py-1 last:border-0"
          >
            <NuxtLink
              :to="buildCatalogUrl(category.slug, manufacturerSlug)"
              class="block rounded-md px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-brand-purple-50 hover:text-accent-600"
              @click="closeMenu"
            >
              {{ category.label }}
            </NuxtLink>
            <ul v-if="category.children?.length" class="space-y-0.5 px-3 pb-2">
              <li v-for="child in category.children" :key="child.slug">
                <NuxtLink
                  :to="buildCatalogUrl(child.slug, manufacturerSlug)"
                  class="block rounded-md py-1 pl-3 text-xs leading-snug text-neutral-600 transition-colors hover:text-accent-600"
                  @click="closeMenu"
                >
                  {{ child.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </SkmPopover>
</template>

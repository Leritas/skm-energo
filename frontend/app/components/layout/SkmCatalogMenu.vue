<script setup lang="ts">
const open = ref(false);
const selectedManufacturerSlug = ref<string | null>(null);

const { data: manufacturers } = await useCatalogManufacturers();
const { tree: visibleCategories } = await useCatalogTaxonomy(
  selectedManufacturerSlug,
);

function closeMenu() {
  open.value = false;
  selectedManufacturerSlug.value = null;
}

watch(open, (isOpen) => {
  if (!isOpen) {
    selectedManufacturerSlug.value = null;
  }
});
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
      <SkmCatalogNavPanel
        v-model:selected-manufacturer-slug="selectedManufacturerSlug"
        :manufacturers="manufacturers ?? []"
        :categories="visibleCategories ?? []"
        variant="dropdown"
        @navigate="closeMenu"
      />
    </template>
  </SkmPopover>
</template>

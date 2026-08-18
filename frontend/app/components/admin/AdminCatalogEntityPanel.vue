<script setup lang="ts">
import type { CatalogAdminTab } from '~/constants/catalog-admin-sections';

defineProps<{
  tab: CatalogAdminTab;
  canManage: boolean;
}>();
</script>

<template>
  <div
    class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
  >
    <AdminManufacturersPanel
      v-if="tab === 'manufacturers'"
      :can-manage="canManage"
    />

    <AdminCategoriesPanel
      v-else-if="tab === 'categories'"
      :can-manage="canManage"
    />

    <AdminProductsPanel
      v-else-if="tab === 'products'"
      :can-manage="canManage"
    />
  </div>
</template>

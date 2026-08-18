<script setup lang="ts">
import {
  canManageCatalogTab,
  getAccessibleCatalogTabs,
  type CatalogAdminTab,
} from '~/constants/catalog-admin-sections';

definePageMeta({
  middleware: ['admin-section'],
  adminSection: 'catalog',
});

useSeoMeta({
  title: 'Каталог — Админка — СКМ-Энергосервис',
});

const auth = useAuthStore();
const permissions = computed(() => auth.permissions);

const tabItems = computed(() => getAccessibleCatalogTabs(permissions.value));

const activeTab = ref<CatalogAdminTab>('manufacturers');

watch(
  tabItems,
  (items) => {
    if (
      items.length > 0 &&
      !items.some((item) => item.value === activeTab.value)
    ) {
      activeTab.value = items[0]!.value;
    }
  },
  { immediate: true },
);

const canManageActiveTab = computed(() =>
  canManageCatalogTab(permissions.value, activeTab.value),
);
</script>

<template>
  <div>
    <SkmPageHeader
      title="Каталог"
      description="Производители, категории и товары. Просмотр и редактирование зависят от назначенных прав."
    />

    <SkmTabs
      v-if="tabItems.length > 1"
      v-model="activeTab"
      :items="tabItems"
      class="mb-6"
    />

    <AdminCatalogEntityPanel
      v-if="tabItems.length > 0"
      :tab="activeTab"
      :can-manage="canManageActiveTab"
    />
  </div>
</template>

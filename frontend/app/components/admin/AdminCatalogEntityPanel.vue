<script setup lang="ts">
import type { CatalogAdminTab } from '~/constants/catalog-admin-sections';
import { getCatalogTabLabel } from '~/constants/catalog-admin-sections';

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

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-neutral-900">
            {{ getCatalogTabLabel(tab) }}
          </h2>
          <p class="mt-2 max-w-2xl text-neutral-600">
            CRUD для раздела появится на следующих этапах roadmap.
          </p>
        </div>

        <SkmButton v-if="canManage" size="sm" disabled> Добавить </SkmButton>
      </div>

      <SkmAlert
        class="mt-6"
        :tone="canManage ? 'neutral' : 'warning'"
        :title="canManage ? 'Режим редактирования' : 'Только просмотр'"
        :description="
          canManage
            ? 'У вас есть права на изменение этой сущности. Кнопки создания и редактирования появятся вместе с API.'
            : 'Доступен только просмотр каталога. Для изменений нужны права управления соответствующим разделом.'
        "
        :icon="canManage ? 'i-lucide-pencil' : 'i-lucide-eye'"
      />
    </template>
  </div>
</template>

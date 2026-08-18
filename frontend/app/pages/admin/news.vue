<script setup lang="ts">
import { Permission } from '@skm/specs';

definePageMeta({
  middleware: ['admin-section'],
  adminSection: 'news',
});

useSeoMeta({
  title: 'Новости — Админка — СКМ-Энергосервис',
});

const { hasPermission } = usePermissions();
const canManage = computed(() => hasPermission(Permission.canManageNews));
</script>

<template>
  <div>
    <SkmPageHeader
      title="Новости"
      description="Публикация и архив новостей. Просмотр доступен без права управления."
    />

    <AdminNewsPanel :can-manage="canManage" />
  </div>
</template>

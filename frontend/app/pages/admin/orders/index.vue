<script setup lang="ts">
import { Permission } from '@skm/specs';
import AdminOrdersPanel from '~/components/admin/orders/AdminOrdersPanel.vue';

definePageMeta({
  middleware: ['admin-section'],
  adminSection: 'orders',
});

useSeoMeta({
  title: 'Заказы — Админка — СКМ-Энергосервис',
});

const { hasPermission } = usePermissions();

const canManage = computed(() => hasPermission(Permission.canManageOrders));
</script>

<template>
  <AdminOrdersPanel :can-manage="canManage" />
</template>

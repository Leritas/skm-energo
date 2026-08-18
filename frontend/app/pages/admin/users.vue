<script setup lang="ts">
import { Permission } from '@skm/specs';

definePageMeta({
  middleware: ['admin-section'],
  adminSection: 'users',
});

useSeoMeta({
  title: 'Пользователи — Админка — СКМ-Энергосервис',
});

const { hasAnyPermission } = usePermissions();

const activeTab = ref('users');

const tabItems = computed(() => {
  const items = [];
  if (
    hasAnyPermission(
      Permission.canCreateUsers,
      Permission.canDeleteUsers,
      Permission.canManageUserRoles,
      Permission.canCreateRoles,
      Permission.canManageRoles,
    )
  ) {
    items.push({ label: 'Пользователи', value: 'users' });
  }
  if (hasAnyPermission(Permission.canCreateRoles, Permission.canManageRoles)) {
    items.push({ label: 'Роли', value: 'roles' });
  }
  return items;
});

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

const showUsers = computed(
  () =>
    activeTab.value === 'users' &&
    hasAnyPermission(
      Permission.canCreateUsers,
      Permission.canDeleteUsers,
      Permission.canManageUserRoles,
      Permission.canCreateRoles,
      Permission.canManageRoles,
    ),
);

const showRoles = computed(
  () =>
    activeTab.value === 'roles' &&
    hasAnyPermission(Permission.canCreateRoles, Permission.canManageRoles),
);
</script>

<template>
  <div>
    <SkmPageHeader
      title="Пользователи и роли"
      description="Управление учётными записями сотрудников и наборами прав доступа."
    />

    <SkmTabs
      v-if="tabItems.length > 1"
      v-model="activeTab"
      :items="tabItems"
      class="mb-6"
    />

    <AdminUsersPanel v-if="showUsers" />
    <AdminRolesPanel v-else-if="showRoles" />
  </div>
</template>

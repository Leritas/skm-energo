<script setup lang="ts">
import {
  getAdminSectionLabel,
  type AdminSectionId,
} from '~/constants/admin-sections';

const route = useRoute();

const sectionId = computed(
  () => route.query.section as AdminSectionId | undefined,
);

const title = computed(() => {
  if (sectionId.value) {
    return `Нет доступа: ${getAdminSectionLabel(sectionId.value)}`;
  }
  return 'Недостаточно прав';
});

const description = computed(() => {
  if (sectionId.value) {
    return 'Обратитесь к администратору, если вам нужен доступ к этому разделу.';
  }
  return 'Для входа в админ-панель требуется право hasAccessToAdmin.';
});

useSeoMeta({
  title: 'Доступ запрещён — Админка — СКМ-Энергосервис',
});
</script>

<template>
  <AdminForbidden :title="title" :description="description" />
</template>

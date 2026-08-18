<script setup lang="ts">
definePageMeta({
  middleware: ['admin-section'],
  adminSection: 'users',
});

useSeoMeta({
  title: 'Пользователи — Админка — СКМ-Энергосервис',
});
</script>

<template>
  <AdminSectionPlaceholder
    title="Пользователи и роли"
    description="Управление пользователями и ролями появится на этапе 4."
  />
</template>

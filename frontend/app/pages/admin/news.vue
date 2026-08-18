<script setup lang="ts">
definePageMeta({
  middleware: ['admin-section'],
  adminSection: 'news',
});

useSeoMeta({
  title: 'Новости — Админка — СКМ-Энергосервис',
});
</script>

<template>
  <AdminSectionPlaceholder
    title="Новости"
    description="Создание и редактирование новостей появится на этапе 4."
  />
</template>

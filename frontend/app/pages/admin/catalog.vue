<script setup lang="ts">
definePageMeta({
  middleware: ['admin-section'],
  adminSection: 'catalog',
});

useSeoMeta({
  title: 'Каталог — Админка — СКМ-Энергосервис',
});
</script>

<template>
  <AdminSectionPlaceholder
    title="Каталог"
    description="Управление производителями, категориями и товарами появится на этапе 4."
  />
</template>

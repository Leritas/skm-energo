<script setup lang="ts">
useSeoMeta({
  title: 'Обзор — Админка — СКМ-Энергосервис',
});

const auth = useAuthStore();
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-neutral-900 md:text-3xl">Обзор</h1>
    <p v-if="auth.user" class="mt-2 text-neutral-600">
      Добро пожаловать, {{ auth.user.name }}.
    </p>

    <div class="mt-8 grid gap-4 md:grid-cols-2">
      <div class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-neutral-500"
        >
          Статус
        </h2>
        <p class="mt-2 text-neutral-900">
          Админ-панель готова к наполнению CRUD-экранами этапа 4.
        </p>
      </div>
      <div class="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-neutral-500"
        >
          Доступные разделы
        </h2>
        <p class="mt-2 text-neutral-900">
          В боковом меню отображаются только те разделы, к которым у вас есть
          права.
        </p>
      </div>
    </div>
  </div>
</template>

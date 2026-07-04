<script setup lang="ts">
definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'Админка — СКМ-Энергосервис',
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-900 text-white">
    <div class="max-w-md rounded-2xl bg-slate-800 p-8 text-center">
      <h1 class="text-2xl font-bold">Админ-панель</h1>
      <p class="mt-3 text-slate-300">
        Заглушка маршрута <code class="text-blue-300">/admin</code>.
        Полная реализация — этап 4 roadmap.
      </p>
      <NuxtLink to="/" class="mt-6 inline-block text-blue-400 hover:underline">
        На главную
      </NuxtLink>
    </div>
  </div>
</template>

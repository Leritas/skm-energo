<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'admin',
})

useSeoMeta({
  title: 'Админка — СКМ-Энергосервис',
})

const auth = useAuthStore()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-900 text-white">
    <div class="max-w-md rounded-2xl bg-slate-800 p-8 text-center">
      <h1 class="text-2xl font-bold">
        Админ-панель
      </h1>
      <p class="mt-3 text-slate-300">
        Доступ разрешён для
        <span class="text-blue-300">{{ auth.user?.email }}</span>.
        Полная реализация — этап 4 roadmap.
      </p>
      <p class="mt-2 text-xs text-slate-400">
        Permissions: {{ auth.user?.permissions?.join(', ') }}
      </p>
      <div class="mt-6 flex justify-center gap-4">
        <NuxtLink
          to="/"
          class="text-blue-400 hover:underline"
        >
          На главную
        </NuxtLink>
        <button
          type="button"
          class="text-slate-300 hover:underline"
          @click="auth.logout().then(() => navigateTo('/login'))"
        >
          Выйти
        </button>
      </div>
    </div>
  </div>
</template>

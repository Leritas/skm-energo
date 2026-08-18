<script setup lang="ts">
const auth = useAuthStore();

async function handleLogout() {
  await auth.logout();
  await navigateTo('/login');
}
</script>

<template>
  <header
    class="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6"
  >
    <div class="flex min-w-0 items-center gap-3">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-accent-600"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        <span class="hidden sm:inline">На сайт</span>
      </NuxtLink>
      <span class="hidden text-neutral-300 sm:inline">|</span>
      <span class="truncate text-sm font-semibold text-neutral-900">
        Админ-панель
      </span>
    </div>

    <div class="flex items-center gap-3">
      <span
        v-if="auth.user"
        class="hidden max-w-[220px] truncate text-sm text-neutral-600 md:inline"
      >
        {{ auth.user.email }}
      </span>
      <SkmButton variant="ghost" size="sm" @click="handleLogout">
        Выйти
      </SkmButton>
    </div>
  </header>
</template>

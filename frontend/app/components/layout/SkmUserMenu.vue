<script setup lang="ts">
import { Permission } from '@skm/specs'

const open = ref(false)
const auth = useAuthStore()
const { hasPermission } = usePermissions()

const isAuthenticated = computed(() => auth.isAuthenticated)

onMounted(async () => {
  if (!auth.hydrated) {
    auth.hydrate()
  }
  if (auth.accessToken && !auth.user) {
    try {
      await auth.fetchMe()
    }
    catch {
      auth.clearSession()
    }
  }
})

function close() {
  open.value = false
}

async function handleLogout() {
  close()
  await auth.logout()
  await navigateTo('/')
}

const menuLinkClass =
  'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50'
</script>

<template>
  <SkmPopover v-model:open="open">
    <SkmButton
      variant="ghost"
      icon="i-lucide-user"
      :aria-label="isAuthenticated ? 'Профиль' : 'Войти или зарегистрироваться'"
      :class="{ 'text-accent-600': open }"
    />

    <template #content>
      <div class="w-64 py-2">
        <template v-if="isAuthenticated && auth.user">
          <div class="border-b border-neutral-100 px-4 pb-3">
            <p class="truncate text-sm font-semibold text-neutral-900">
              {{ auth.user.name }}
            </p>
            <p class="truncate text-xs text-neutral-500">
              {{ auth.user.email }}
            </p>
          </div>

          <nav class="space-y-0.5 p-2">
            <NuxtLink
              to="/account"
              :class="menuLinkClass"
              @click="close"
            >
              <UIcon name="i-lucide-layout-dashboard" class="size-4 shrink-0" />
              Личный кабинет
            </NuxtLink>
            <NuxtLink
              v-if="hasPermission(Permission.hasAccessToAdmin)"
              to="/admin"
              :class="menuLinkClass"
              @click="close"
            >
              <UIcon name="i-lucide-shield" class="size-4 shrink-0" />
              Админ-панель
            </NuxtLink>
            <button
              type="button"
              :class="menuLinkClass"
              @click="handleLogout"
            >
              <UIcon name="i-lucide-log-out" class="size-4 shrink-0" />
              Выйти
            </button>
          </nav>
        </template>

        <template v-else>
          <div class="px-4 pb-2">
            <p class="text-sm font-semibold text-neutral-900">
              Аккаунт
            </p>
            <p class="mt-1 text-xs text-neutral-500">
              Войдите или создайте аккаунт покупателя.
            </p>
          </div>
          <nav class="space-y-0.5 p-2">
            <NuxtLink
              to="/login"
              :class="menuLinkClass"
              @click="close"
            >
              <UIcon name="i-lucide-log-in" class="size-4 shrink-0" />
              Войти
            </NuxtLink>
            <NuxtLink
              to="/register"
              :class="menuLinkClass"
              @click="close"
            >
              <UIcon name="i-lucide-user-plus" class="size-4 shrink-0" />
              Регистрация
            </NuxtLink>
          </nav>
        </template>
      </div>
    </template>
  </SkmPopover>
</template>

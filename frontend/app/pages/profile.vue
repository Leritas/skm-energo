<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const auth = useAuthStore()
const route = useRoute()

const nav = [
  { label: 'Данные', to: '/profile/info', match: '/profile/info' },
  { label: 'Заказы', to: '/profile/orders', match: '/profile/orders' },
  { label: 'Избранное', to: '/profile/favorite', match: '/profile/favorite' },
] as const

function isActive(match: string) {
  return route.path === match || route.path.startsWith(`${match}/`)
}

async function handleLogout() {
  await auth.logout()
  await navigateTo('/')
}

onMounted(async () => {
  if (!auth.hydrated) auth.hydrate()
  if (auth.accessToken) {
    try {
      await auth.fetchMe()
    }
    catch {
      auth.clearSession()
      await navigateTo('/login')
    }
  }
})
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 md:text-4xl">
          Личный кабинет
        </h1>
        <p
          v-if="auth.user"
          class="mt-2 text-neutral-600"
        >
          {{ auth.user.name }}
          <span class="text-neutral-400">·</span>
          {{ auth.user.email }}
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside class="space-y-1">
          <nav class="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            <NuxtLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              :class="
                isActive(item.match)
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              "
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
          <SkmButton
            variant="ghost"
            class="mt-4 w-full justify-start"
            @click="handleLogout"
          >
            Выйти
          </SkmButton>
        </aside>
        <div class="min-w-0">
          <NuxtPage />
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

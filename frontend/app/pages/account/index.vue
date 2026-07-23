<script setup lang="ts">
import { Permission } from '@skm/specs'
import { SITE } from '~/constants/site'

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: `Личный кабинет — ${SITE.name}`,
  description: 'Профиль пользователя и заказы.',
})

const auth = useAuthStore()
const { hasPermission } = usePermissions()
const loading = ref(true)

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Кабинет' },
]

const orders = [
  {
    number: 'SKM-1042',
    dateLabel: '18 июля 2026',
    status: 'processing' as const,
    to: '/account',
  },
  {
    number: 'SKM-1038',
    dateLabel: '5 июля 2026',
    status: 'completed' as const,
    to: '/account',
  },
]

const tableData = [
  { number: 'SKM-1042', status: 'В работе', total: 'по запросу' },
  { number: 'SKM-1038', status: 'Выполнен', total: 'по запросу' },
]

const tableColumns = [
  { accessorKey: 'number', header: 'Номер' },
  { accessorKey: 'status', header: 'Статус' },
  { accessorKey: 'total', header: 'Сумма' },
]

const roleLabels = computed(() =>
  auth.user?.roles.map((role) => role.name).join(', ') ?? '—',
)

onMounted(async () => {
  if (!auth.hydrated) {
    auth.hydrate()
  }
  try {
    await auth.fetchMe()
  }
  catch {
    auth.clearSession()
    await navigateTo('/login')
  }
  finally {
    loading.value = false
  }
})

async function handleLogout() {
  await auth.logout()
  await navigateTo('/')
}
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        title="Личный кабинет"
        description="Профиль, роли и история заказов."
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div
        v-if="loading"
        class="rounded-xl border border-neutral-100 bg-white p-8 text-center text-sm text-neutral-500"
      >
        Загрузка профиля…
      </div>

      <template v-else-if="auth.user">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <SkmCard class="h-fit">
            <div class="flex items-start gap-4">
              <div
                class="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600"
              >
                <UIcon name="i-lucide-user" class="size-7" />
              </div>
              <div class="min-w-0">
                <h2 class="truncate text-lg font-semibold text-neutral-900">
                  {{ auth.user.name }}
                </h2>
                <p class="mt-1 truncate text-sm text-neutral-500">
                  {{ auth.user.email }}
                </p>
              </div>
            </div>

            <dl class="mt-6 space-y-4 text-sm">
              <div>
                <dt class="font-medium text-neutral-500">
                  Роли
                </dt>
                <dd class="mt-1 text-neutral-900">
                  {{ roleLabels }}
                </dd>
              </div>
              <div>
                <dt class="font-medium text-neutral-500">
                  ID пользователя
                </dt>
                <dd class="mt-1 text-neutral-900">
                  {{ auth.user.id }}
                </dd>
              </div>
            </dl>

            <div class="mt-6 flex flex-col gap-2">
              <NuxtLink
                v-if="hasPermission(Permission.hasAccessToAdmin)"
                to="/admin"
              >
                <SkmButton
                  variant="outline"
                  class="w-full justify-center"
                >
                  Админ-панель
                </SkmButton>
              </NuxtLink>
              <SkmButton
                variant="ghost"
                class="w-full justify-center"
                @click="handleLogout"
              >
                Выйти
              </SkmButton>
            </div>
          </SkmCard>

          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Заказы
            </h2>
            <p class="mt-1 text-sm text-neutral-500">
              Демо-данные до этапа 6 roadmap (реальные заказы из API).
            </p>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <SkmOrderCard
                v-for="order in orders"
                :key="order.number"
                :number="order.number"
                :date-label="order.dateLabel"
                :status="order.status"
                :to="order.to"
              />
            </div>

            <h2 class="mt-12 text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Таблица заказов
            </h2>
            <div class="mt-4 overflow-x-auto">
              <SkmTable
                :data="tableData"
                :columns="tableColumns"
              />
            </div>

            <h2 class="mt-12 text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Отзывы (demo)
            </h2>
            <div class="mt-4 max-w-lg">
              <SkmReviewCard
                author="ООО «ЭнергоСнаб»"
                date-label="10 июня 2026"
                :rating="5"
                text="Оперативная поставка, документы в порядке."
              />
            </div>
          </div>
        </div>
      </template>
    </SkmContainer>
  </SkmSection>
</template>

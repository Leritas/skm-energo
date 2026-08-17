<script setup lang="ts">
import { Permission } from '@skm/specs'
import { MANUFACTURERS } from '~/constants/catalog-mocks'
import { MAIN_NAV } from '~/constants/navigation'
import { SITE } from '~/constants/site'
import { buildCatalogUrl, getVisibleCategoryTree } from '~/utils/catalog'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  callOrder: []
}>()

const auth = useAuthStore()
const { hasPermission } = usePermissions()

const expandedCatalog = ref(false)
const activeManufacturerSlug = ref<string | null>(null)

const visibleCategories = computed(() =>
  getVisibleCategoryTree(activeManufacturerSlug.value),
)

function toggleCatalog() {
  expandedCatalog.value = !expandedCatalog.value
}

function toggleManufacturer(slug: string) {
  activeManufacturerSlug.value =
    activeManufacturerSlug.value === slug ? null : slug
}

function close() {
  open.value = false
  expandedCatalog.value = false
  activeManufacturerSlug.value = null
}

async function handleLogout() {
  close()
  await auth.logout()
  await navigateTo('/')
}

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
</script>

<template>
  <SkmSlideover v-model:open="open" side="right" title="Меню">
    <template #body>
      <nav class="flex flex-col gap-1">
        <template v-for="item in MAIN_NAV" :key="item.to">
          <div v-if="item.children">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base font-medium text-neutral-900 hover:bg-neutral-50"
              @click="toggleCatalog"
            >
              {{ item.label }}
              <UIcon
                name="i-lucide-chevron-down"
                class="size-5 transition-transform"
                :class="{ 'rotate-180': expandedCatalog }"
              />
            </button>
            <div
              v-if="expandedCatalog"
              class="ml-3 space-y-3 border-l border-neutral-200 pl-3"
            >
              <NuxtLink
                :to="buildCatalogUrl(null, activeManufacturerSlug)"
                class="block rounded-md px-3 py-2 text-sm font-medium text-accent-600"
                @click="close"
              >
                Весь каталог
              </NuxtLink>

              <div class="flex flex-wrap gap-2 px-3">
                <button
                  v-for="manufacturer in MANUFACTURERS"
                  :key="manufacturer.slug"
                  type="button"
                  @click="toggleManufacturer(manufacturer.slug)"
                >
                  <SkmBadge
                    :label="manufacturer.label"
                    :tone="activeManufacturerSlug === manufacturer.slug ? 'accent' : 'neutral'"
                    size="sm"
                  />
                </button>
              </div>

              <div
                v-for="category in visibleCategories"
                :key="category.slug"
                class="py-1"
              >
                <NuxtLink
                  :to="buildCatalogUrl(category.slug, activeManufacturerSlug)"
                  class="block px-3 py-1 text-sm font-semibold text-neutral-800"
                  @click="close"
                >
                  {{ category.label }}
                </NuxtLink>
                <ul v-if="category.children?.length" class="pl-3">
                  <li
                    v-for="child in category.children"
                    :key="child.slug"
                    class="py-0.5"
                  >
                    <NuxtLink
                      :to="buildCatalogUrl(child.slug, activeManufacturerSlug)"
                      class="text-xs text-neutral-500"
                      @click="close"
                    >
                      {{ child.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <NuxtLink
            v-else
            :to="item.to"
            class="rounded-lg px-3 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-50"
            @click="close"
          >
            {{ item.label }}
          </NuxtLink>
        </template>
      </nav>

      <div class="mt-8 space-y-3 border-t border-neutral-100 pt-6">
        <p class="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Аккаунт
        </p>
        <template v-if="auth.isAuthenticated && auth.user">
          <p class="px-3 text-sm font-medium text-neutral-900">
            {{ auth.user.name }}
          </p>
          <p class="px-3 text-xs text-neutral-500">
            {{ auth.user.email }}
          </p>
          <NuxtLink
            to="/profile"
            class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            @click="close"
          >
            <UIcon name="i-lucide-layout-dashboard" class="size-4 text-accent-500" />
            Личный кабинет
          </NuxtLink>
          <NuxtLink
            v-if="hasPermission(Permission.hasAccessToAdmin)"
            to="/admin"
            class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            @click="close"
          >
            <UIcon name="i-lucide-shield" class="size-4 text-accent-500" />
            Админ-панель
          </NuxtLink>
          <SkmButton
            variant="outline"
            class="w-full justify-center"
            @click="handleLogout"
          >
            Выйти
          </SkmButton>
        </template>
        <template v-else>
          <NuxtLink
            to="/login"
            class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            @click="close"
          >
            <UIcon name="i-lucide-log-in" class="size-4 text-accent-500" />
            Войти
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            @click="close"
          >
            <UIcon name="i-lucide-user-plus" class="size-4 text-accent-500" />
            Регистрация
          </NuxtLink>
        </template>
      </div>

      <div class="mt-6 space-y-3 border-t border-neutral-100 pt-6">
        <a
          :href="SITE.phoneHref"
          class="flex items-center gap-2 text-sm font-medium text-neutral-900"
        >
          <UIcon name="i-lucide-phone" class="size-4 text-accent-500" />
          {{ SITE.phone }}
        </a>
        <a
          :href="`mailto:${SITE.email}`"
          class="flex items-center gap-2 text-sm text-neutral-600"
        >
          <UIcon name="i-lucide-mail" class="size-4 text-accent-500" />
          {{ SITE.email }}
        </a>
        <SkmButton
          class="w-full justify-center"
          @click="
            () => {
              close()
              emit('callOrder')
            }
          "
        >
          Заказать звонок
        </SkmButton>
      </div>
    </template>
  </SkmSlideover>
</template>

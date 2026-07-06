<script setup lang="ts">
import { MAIN_NAV } from '~/constants/navigation'
import { SITE } from '~/constants/site'

const mobileNavOpen = ref(false)
const callModalOpen = ref(false)

const toast = useToast()

function handleSearch() {
  toast.add({
    title: 'Поиск',
    description: 'Функция будет доступна на этапе 5 roadmap.',
    color: 'neutral',
  })
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-neutral-100 bg-white">
    <AppContainer>
      <div class="flex h-16 items-center justify-between gap-4 md:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex shrink-0 items-center gap-3">
          <img
            src="/logo.jpg"
            alt="СКМ-Энергосервис"
            class="h-10 w-auto md:h-12"
          />
          <span class="hidden text-sm font-bold tracking-wide text-neutral-900 sm:block">
            SKM<br class="md:hidden" />
            <span class="hidden md:inline"> </span>ENERGOSERVICE
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden items-center gap-6 md:flex">
          <template v-for="item in MAIN_NAV" :key="item.to">
            <AppCatalogMenu v-if="item.children" />
            <NuxtLink
              v-else
              :to="item.to"
              class="text-sm font-medium text-neutral-700 transition-colors hover:text-accent-600"
              active-class="!text-accent-600"
            >
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>

        <!-- Desktop actions -->
        <div class="hidden items-center gap-4 md:flex">
          <div class="flex flex-col items-end text-right">
            <a
              :href="SITE.phoneHref"
              class="text-sm font-semibold text-neutral-900 hover:text-accent-600"
            >
              {{ SITE.phone }}
            </a>
            <a
              :href="`mailto:${SITE.email}`"
              class="text-xs text-neutral-500 hover:text-accent-600"
            >
              {{ SITE.email }}
            </a>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-search"
            aria-label="Поиск"
            @click="handleSearch"
          />
          <AppButton size="sm" @click="callModalOpen = true">
            Заказать звонок
          </AppButton>
        </div>

        <!-- Mobile burger -->
        <div class="flex items-center gap-2 md:hidden">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-search"
            aria-label="Поиск"
            @click="handleSearch"
          />
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-menu"
            aria-label="Открыть меню"
            @click="mobileNavOpen = true"
          />
        </div>
      </div>
    </AppContainer>

    <AppMobileNav v-model:open="mobileNavOpen" @call-order="callModalOpen = true" />
    <AppCallOrderModal v-model:open="callModalOpen" />
  </header>
</template>

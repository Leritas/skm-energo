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
    <SkmContainer>
      <div
        class="flex h-16 flex-nowrap items-center justify-between gap-2 md:h-20 md:gap-3"
      >
        <!-- Logo -->
        <NuxtLink to="/" class="flex shrink-0 items-center">
          <img
            src="/logo.jpg"
            alt="СКМ-Энергосервис"
            class="h-9 w-auto md:h-10 lg:h-12"
          >
        </NuxtLink>

        <!-- Desktop nav (768+) -->
        <nav
          class="hidden min-w-0 shrink items-center gap-3 whitespace-nowrap md:flex lg:gap-5 xl:gap-6"
        >
          <template v-for="item in MAIN_NAV" :key="item.to">
            <SkmCatalogMenu v-if="item.children" />
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

        <!-- Desktop actions (768+): контакты → заказ звонка → поиск -->
        <div class="hidden shrink-0 items-center gap-1 md:flex md:gap-2">
          <div class="flex flex-col items-end text-right">
            <a
              :href="SITE.phoneHref"
              class="whitespace-nowrap text-xs font-semibold text-neutral-900 hover:text-accent-600 lg:text-sm"
            >
              {{ SITE.phone }}
            </a>
            <a
              :href="`mailto:${SITE.email}`"
              class="whitespace-nowrap text-[11px] text-neutral-500 hover:text-accent-600 lg:text-xs"
            >
              {{ SITE.email }}
            </a>
          </div>

          <SkmButton
            variant="ghost"
            icon="i-lucide-phone-call"
            aria-label="Заказать звонок"
            @click="callModalOpen = true"
          />
          <SkmButton
            variant="ghost"
            icon="i-lucide-search"
            aria-label="Поиск"
            @click="handleSearch"
          />
        </div>

        <!-- Mobile (<768) -->
        <div class="flex shrink-0 items-center gap-1 md:hidden">
          <SkmButton
            variant="ghost"
            icon="i-lucide-phone-call"
            aria-label="Заказать звонок"
            @click="callModalOpen = true"
          />
          <SkmButton
            variant="ghost"
            icon="i-lucide-search"
            aria-label="Поиск"
            @click="handleSearch"
          />
          <SkmButton
            variant="ghost"
            icon="i-lucide-menu"
            aria-label="Открыть меню"
            @click="mobileNavOpen = true"
          />
        </div>
      </div>
    </SkmContainer>

    <SkmMobileNav v-model:open="mobileNavOpen" @call-order="callModalOpen = true" />
    <SkmCallOrderModal v-model:open="callModalOpen" />
  </header>
</template>

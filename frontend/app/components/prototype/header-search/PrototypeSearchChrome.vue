<script setup lang="ts">
import { MAIN_NAV } from '~/constants/navigation';
import { SITE } from '~/constants/site';

defineProps<{
  variantLabel: string;
  stateSummary: string;
}>();

const emit = defineEmits<{
  searchClick: [];
}>();
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <header class="sticky top-0 z-40 border-b border-neutral-100 bg-white">
      <SkmContainer>
        <div
          class="flex h-16 flex-nowrap items-center justify-between gap-2 md:h-20 md:gap-3"
        >
          <NuxtLink to="/" class="flex shrink-0 items-center">
            <img
              src="/logo.jpg"
              alt="СКМ-Энергосервис"
              class="h-9 w-auto md:h-10 lg:h-12"
            />
          </NuxtLink>

          <nav
            class="hidden min-w-0 shrink items-center gap-3 whitespace-nowrap md:flex lg:gap-5 xl:gap-6"
          >
            <template v-for="item in MAIN_NAV" :key="item.to">
              <span
                v-if="item.children"
                class="text-sm font-medium text-neutral-700"
              >
                {{ item.label }} ▾
              </span>
              <NuxtLink
                v-else
                :to="item.to"
                class="text-sm font-medium text-neutral-700 transition-colors hover:text-accent-600"
              >
                {{ item.label }}
              </NuxtLink>
            </template>
          </nav>

          <div class="hidden shrink-0 items-center gap-1 md:flex md:gap-2">
            <div class="flex flex-col items-end text-right">
              <span
                class="whitespace-nowrap text-xs font-semibold text-neutral-900 lg:text-sm"
              >
                {{ SITE.phone }}
              </span>
              <span
                class="whitespace-nowrap text-[11px] text-neutral-500 lg:text-xs"
              >
                {{ SITE.email }}
              </span>
            </div>
            <SkmButton
              variant="ghost"
              icon="i-lucide-phone-call"
              aria-label="Заказать звонок"
            />
            <slot name="search-trigger">
              <SkmButton
                variant="ghost"
                icon="i-lucide-search"
                aria-label="Поиск"
                @click="emit('searchClick')"
              />
            </slot>
            <div
              class="size-9 rounded-full bg-neutral-100"
              aria-hidden="true"
            />
          </div>

          <div class="flex shrink-0 items-center gap-1 md:hidden">
            <SkmButton
              variant="ghost"
              icon="i-lucide-phone-call"
              aria-label="Заказать звонок"
            />
            <slot name="search-trigger-mobile">
              <SkmButton
                variant="ghost"
                icon="i-lucide-search"
                aria-label="Поиск"
                @click="emit('searchClick')"
              />
            </slot>
            <SkmButton variant="ghost" icon="i-lucide-menu" aria-label="Меню" />
          </div>
        </div>
      </SkmContainer>
      <slot name="header-extension" />
    </header>

    <slot />

    <div class="pointer-events-none mt-10 opacity-35">
      <SkmContainer>
        <div class="space-y-4">
          <div class="h-8 w-72 rounded bg-neutral-200" />
          <div class="h-4 max-w-2xl rounded bg-neutral-200" />
          <div class="h-4 max-w-xl rounded bg-neutral-200" />
          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <div
              v-for="index in 3"
              :key="index"
              class="aspect-[4/3] rounded-lg bg-neutral-200"
            />
          </div>
        </div>
      </SkmContainer>
    </div>

    <div
      class="fixed bottom-24 left-4 z-30 max-w-sm rounded-lg border border-neutral-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm"
    >
      <p class="font-mono text-accent-600">{{ variantLabel }}</p>
      <p class="mt-1 text-neutral-600">{{ stateSummary }}</p>
    </div>
  </div>
</template>

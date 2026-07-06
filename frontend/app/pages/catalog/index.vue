<script setup lang="ts">
import { CATALOG_TREE } from '~/constants/navigation'
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `Каталог — ${SITE.name}`,
  description: 'Каталог продукции и производителей: MERSEN, CASRAM, Lampar, HIITIO.',
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Каталог' },
]
</script>

<template>
  <AppSection>
    <AppContainer>
      <AppBreadcrumbs :items="breadcrumbs" />
      <h1 class="text-3xl font-bold text-neutral-900 md:text-4xl">
        Каталог продукции
      </h1>
      <p class="mt-4 max-w-2xl text-neutral-600">
        Раздел в разработке. Категории и товары будут добавляться через
        админ-панель на этапе 4–5 roadmap. Ниже — структура каталога.
      </p>

      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="item in CATALOG_TREE"
          :key="item.label"
          class="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm"
        >
          <h2 class="text-lg font-semibold text-neutral-900">
            {{ item.label }}
          </h2>
          <ul v-if="item.children?.length" class="mt-3 space-y-1">
            <li
              v-for="child in item.children"
              :key="child.label"
              class="text-sm text-neutral-500"
            >
              {{ child.label }}
            </li>
          </ul>
          <p v-else class="mt-3 text-sm text-neutral-400">
            Скоро
          </p>
        </div>
      </div>
    </AppContainer>
  </AppSection>
</template>

<script setup lang="ts">
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `Новости — ${SITE.name}`,
  description: `Новости компании ${SITE.legalName}.`,
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Новости' },
]
</script>

<template>
  <AppSection>
    <AppContainer>
      <AppBreadcrumbs :items="breadcrumbs" />
      <h1 class="text-3xl font-bold text-neutral-900 md:text-4xl">
        Новости
      </h1>
      <p class="mt-4 text-neutral-600">
        Раздел в разработке. Новости будут добавляться через админ-панель на
        этапе 4 roadmap.
      </p>
    </AppContainer>
  </AppSection>
</template>

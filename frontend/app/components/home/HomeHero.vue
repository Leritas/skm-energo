<script setup lang="ts">
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `${SITE.name} — поставка электрооборудования`,
  description: SITE.tagline,
})
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <div class="max-w-3xl">
        <p class="text-sm font-medium uppercase tracking-wide text-accent-600">
          Высоковольтные компоненты
        </p>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
          {{ SITE.name }}
        </h1>
        <p class="mt-6 text-lg leading-relaxed text-neutral-600">
          {{ SITE.tagline }}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <SkmButton to="/catalog">Каталог продукции</SkmButton>
          <SkmButton variant="outline" to="/contacts">Связаться с нами</SkmButton>
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

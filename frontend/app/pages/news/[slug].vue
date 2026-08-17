<script setup lang="ts">
import { getNewsArticle } from '~/constants/news-mocks'
import { SITE } from '~/constants/site'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const article = computed(() => getNewsArticle(slug.value))

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Новость не найдена' })
}

useSeoMeta({
  title: `${article.value.title} — ${SITE.name}`,
  description: article.value.excerpt,
})

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Новости', to: '/news' },
  { label: article.value!.title },
])
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmBreadcrumbs :items="breadcrumbs" />
      <article class="mx-auto max-w-3xl">
        <p class="text-sm text-neutral-500">
          {{ article!.dateLabel }}
        </p>
        <h1 class="mt-2 text-3xl font-bold text-neutral-900 md:text-4xl">
          {{ article!.title }}
        </h1>
        <div class="prose-neutral mt-8 space-y-4 text-neutral-600 leading-relaxed">
          <p v-for="(paragraph, index) in article!.body" :key="index">
            {{ paragraph }}
          </p>
        </div>
        <SkmButton class="mt-10" variant="outline" to="/news">
          Все новости
        </SkmButton>
      </article>
    </SkmContainer>
  </SkmSection>
</template>

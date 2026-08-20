<script setup lang="ts">
import {
  formatNewsDate,
  resolveNewsSeoDescription,
  resolveNewsSeoTitle,
} from '~/utils/news';
import { SITE } from '~/constants/site';

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ''));

const { data: article, error: articleError } = await useNewsArticle(slug);

if (articleError.value) {
  throw createError({
    statusCode: articleError.value.statusCode === 404 ? 404 : 500,
    statusMessage:
      articleError.value.statusCode === 404
        ? 'Новость не найдена'
        : 'Не удалось загрузить новость',
  });
}

useSeoMeta({
  title: () => `${resolveNewsSeoTitle(article.value!)} — ${SITE.name}`,
  description: () => resolveNewsSeoDescription(article.value!),
});

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Новости', to: '/news' },
  { label: article.value!.title },
]);
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmBreadcrumbs :items="breadcrumbs" />
      <article class="mx-auto max-w-3xl">
        <div
          v-if="article!.coverPhoto?.url"
          class="mb-8 overflow-hidden rounded-xl bg-neutral-100"
        >
          <img
            :src="article!.coverPhoto.url"
            :alt="article!.title"
            class="aspect-[16/9] w-full object-cover"
          />
        </div>
        <p class="text-sm text-neutral-500">
          {{ formatNewsDate(article!.publishDate) }}
        </p>
        <h1 class="mt-2 text-3xl font-bold text-neutral-900 md:text-4xl">
          {{ article!.title }}
        </h1>
        <div
          class="prose-neutral mt-8 space-y-4 text-neutral-600 leading-relaxed"
        >
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

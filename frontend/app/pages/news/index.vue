<script setup lang="ts">
import { formatNewsDate } from '~/utils/news';
import { SITE } from '~/constants/site';

const { data: articles, error: articlesError } = await useNewsArticles();

if (articlesError.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Не удалось загрузить новости',
  });
}

useSeoMeta({
  title: `Новости — ${SITE.name}`,
  description: `Новости компании ${SITE.legalName}.`,
});

const breadcrumbs = [{ label: 'Главная', to: '/' }, { label: 'Новости' }];
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        title="Новости"
        description="Актуальные события и обновления ассортимента."
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <SkmEmpty
        v-if="!articles?.length"
        title="Новостей пока нет"
        description="Следите за обновлениями — скоро здесь появятся материалы."
        class="mt-4"
      />

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SkmNewsCard
          v-for="item in articles ?? []"
          :key="item.slug"
          :title="item.title"
          :to="`/news/${item.slug}`"
          :date-label="formatNewsDate(item.publishDate)"
          :excerpt="item.excerpt"
        />
      </div>
    </SkmContainer>
  </SkmSection>
</template>

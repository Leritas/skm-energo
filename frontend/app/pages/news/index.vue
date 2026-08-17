<script setup lang="ts">
import { NEWS_ARTICLES } from '~/constants/news-mocks'
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

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SkmNewsCard
          v-for="item in NEWS_ARTICLES"
          :key="item.slug"
          :title="item.title"
          :to="`/news/${item.slug}`"
          :date-label="item.dateLabel"
          :excerpt="item.excerpt"
        />
      </div>
    </SkmContainer>
  </SkmSection>
</template>

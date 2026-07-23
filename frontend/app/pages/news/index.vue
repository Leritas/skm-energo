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

const mockNews = [
  {
    title: 'Расширение ассортимента HIITIO',
    to: '/news/hiitio-expand',
    dateLabel: '15 июля 2026',
    excerpt:
      'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
  },
  {
    title: 'Обновлён PDF-каталог MERSEN',
    to: '/news/mersen-pdf',
    dateLabel: '2 июля 2026',
    excerpt:
      'Актуальные datasheet и спецификации доступны для скачивания в карточках товаров.',
  },
  {
    title: 'График работы в августе',
    to: '/news/august-hours',
    dateLabel: '28 июня 2026',
    excerpt: 'Офис и склад работают по летнему расписанию. Заявки принимаем онлайн.',
  },
]
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        title="Новости"
        description="Раздел в разработке. Ниже — демо-лента на mock-данных."
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SkmNewsCard
          v-for="item in mockNews"
          :key="item.to"
          :title="item.title"
          :to="item.to"
          :date-label="item.dateLabel"
          :excerpt="item.excerpt"
        />
      </div>
    </SkmContainer>
  </SkmSection>
</template>

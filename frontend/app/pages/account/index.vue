<script setup lang="ts">
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `Личный кабинет — ${SITE.name}`,
  description: 'Account stub.',
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Кабинет' },
]

const orders = [
  {
    number: 'SKM-1042',
    dateLabel: '18 июля 2026',
    status: 'processing' as const,
    to: '/account',
  },
  {
    number: 'SKM-1038',
    dateLabel: '5 июля 2026',
    status: 'completed' as const,
    to: '/account',
  },
]

const tableData = [
  { number: 'SKM-1042', status: 'В работе', total: 'по запросу' },
  { number: 'SKM-1038', status: 'Выполнен', total: 'по запросу' },
]

const tableColumns = [
  { accessorKey: 'number', header: 'Номер' },
  { accessorKey: 'status', header: 'Статус' },
  { accessorKey: 'total', header: 'Сумма' },
]
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        title="Личный кабинет"
        description="Stub ЛК: заказы и таблица на mock-данных."
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">
        Заказы
      </h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <SkmOrderCard
          v-for="order in orders"
          :key="order.number"
          :number="order.number"
          :date-label="order.dateLabel"
          :status="order.status"
          :to="order.to"
        />
      </div>

      <h2 class="mt-12 text-sm font-semibold uppercase tracking-wide text-neutral-900">
        Таблица заказов
      </h2>
      <div class="mt-4 overflow-x-auto">
        <SkmTable
          :data="tableData"
          :columns="tableColumns"
        />
      </div>

      <h2 class="mt-12 text-sm font-semibold uppercase tracking-wide text-neutral-900">
        Отзывы (demo)
      </h2>
      <div class="mt-4 max-w-lg">
        <SkmReviewCard
          author="ООО «ЭнергоСнаб»"
          date-label="10 июня 2026"
          :rating="5"
          text="Оперативная поставка, документы в порядке."
        />
      </div>
    </SkmContainer>
  </SkmSection>
</template>

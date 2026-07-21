<script setup lang="ts">
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `Оформление — ${SITE.name}`,
  description: 'Checkout stub.',
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Корзина', to: '/cart' },
  { label: 'Оформление' },
]

const steps = [
  { label: 'Корзина' },
  { label: 'Данные' },
  { label: 'Подтверждение' },
]
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        title="Оформление запроса"
        description="Stub checkout без платёжной логики."
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <SkmStepper
        :steps="steps"
        :current="1"
        class="mb-10"
      />

      <SkmAlert
        title="B2B-запрос"
        description="После отправки менеджер уточнит наличие и сроки поставки."
        tone="accent"
        icon="i-lucide-info"
        class="mb-8 max-w-xl"
      />

      <form class="max-w-md space-y-4">
        <SkmFormField label="Компания" required>
          <SkmInput placeholder="ООО «…»" />
        </SkmFormField>
        <SkmFormField label="Контакт" required>
          <SkmInput placeholder="Имя и телефон" />
        </SkmFormField>
        <SkmFormField label="Комментарий">
          <SkmTextarea :rows="3" placeholder="Срок, объект, доп. требования" />
        </SkmFormField>
        <SkmButton type="button" variant="primary">
          Отправить запрос
        </SkmButton>
      </form>
    </SkmContainer>
  </SkmSection>
</template>

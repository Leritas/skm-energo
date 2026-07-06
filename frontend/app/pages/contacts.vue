<script setup lang="ts">
import { SITE } from '~/constants/site'

useSeoMeta({
  title: `Контакты — ${SITE.name}`,
  description: `Контактная информация ${SITE.legalName}: телефон, email, адрес.`,
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Контакты' },
]

const name = ref('')
const email = ref('')
const message = ref('')
const submitted = ref(false)

function handleSubmit() {
  submitted.value = true
}
</script>

<template>
  <AppSection>
    <AppContainer>
      <AppBreadcrumbs :items="breadcrumbs" />
      <h1 class="text-3xl font-bold text-neutral-900 md:text-4xl">
        Контакты
      </h1>

      <div class="mt-10 grid gap-12 lg:grid-cols-2">
        <div class="space-y-6">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Телефон
            </h2>
            <a
              :href="SITE.phoneHref"
              class="mt-2 block text-lg font-medium text-accent-600 hover:text-accent-700"
            >
              {{ SITE.phone }}
            </a>
          </div>
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Email
            </h2>
            <a
              :href="`mailto:${SITE.email}`"
              class="mt-2 block text-lg text-neutral-700 hover:text-accent-600"
            >
              {{ SITE.email }}
            </a>
          </div>
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Адрес
            </h2>
            <p class="mt-2 text-neutral-600">{{ SITE.address }}</p>
          </div>
        </div>

        <div class="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-neutral-900">
            Форма обратной связи
          </h2>
          <div v-if="submitted" class="mt-6 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
            Функция отправки будет доступна на этапе 8 roadmap.
          </div>
          <form v-else class="mt-6 space-y-4" @submit.prevent="handleSubmit">
            <UFormField label="Имя">
              <UInput v-model="name" placeholder="Ваше имя" required />
            </UFormField>
            <UFormField label="Email">
              <UInput
                v-model="email"
                type="email"
                placeholder="email@example.com"
                required
              />
            </UFormField>
            <UFormField label="Сообщение">
              <UTextarea
                v-model="message"
                placeholder="Ваш вопрос или комментарий"
                :rows="4"
                required
              />
            </UFormField>
            <AppButton type="submit">Отправить</AppButton>
          </form>
        </div>
      </div>
    </AppContainer>
  </AppSection>
</template>

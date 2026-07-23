<script setup lang="ts">
import { SITE } from '~/constants/site'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: `Регистрация — ${SITE.name}`,
})

const auth = useAuthStore()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(name.value, email.value, password.value)
    await navigateTo('/account')
  }
  catch (e: unknown) {
    error.value = 'Не удалось зарегистрироваться. Возможно, email уже занят.'
    console.error(e)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <div class="mx-auto max-w-md">
        <h1 class="text-3xl font-bold text-neutral-900">
          Регистрация
        </h1>
        <p class="mt-2 text-neutral-600">
          Создайте аккаунт покупателя.
        </p>

        <SkmAlert
          v-if="error"
          class="mt-6"
          tone="danger"
          :title="error"
        />

        <form
          class="mt-8 space-y-4"
          @submit.prevent="handleSubmit"
        >
          <SkmFormField label="Имя">
            <SkmInput
              v-model="name"
              autocomplete="name"
              required
            />
          </SkmFormField>
          <SkmFormField label="Email">
            <SkmInput
              v-model="email"
              type="email"
              autocomplete="email"
              required
            />
          </SkmFormField>
          <SkmFormField label="Пароль">
            <SkmInput
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
            />
          </SkmFormField>
          <SkmButton
            type="submit"
            class="w-full"
            :disabled="loading"
          >
            {{ loading ? 'Создание…' : 'Создать аккаунт' }}
          </SkmButton>
        </form>

        <p class="mt-6 text-sm text-neutral-600">
          Уже есть аккаунт?
          <NuxtLink
            to="/login"
            class="font-medium text-accent-600 hover:underline"
          >
            Войти
          </NuxtLink>
        </p>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

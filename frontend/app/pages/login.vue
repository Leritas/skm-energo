<script setup lang="ts">
import { SITE } from '~/constants/site'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: `Вход — ${SITE.name}`,
})

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = useRoute().query.redirect
    await navigateTo(typeof redirect === 'string' ? redirect : '/account')
  }
  catch (e: unknown) {
    error.value = 'Неверный email или пароль'
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
          Вход
        </h1>
        <p class="mt-2 text-neutral-600">
          Войдите в личный кабинет СКМ-Энергосервис.
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
              autocomplete="current-password"
              required
            />
          </SkmFormField>
          <SkmButton
            type="submit"
            class="w-full"
            :disabled="loading"
          >
            {{ loading ? 'Вход…' : 'Войти' }}
          </SkmButton>
        </form>

        <p class="mt-6 text-sm text-neutral-600">
          Нет аккаунта?
          <NuxtLink
            to="/register"
            class="font-medium text-accent-600 hover:underline"
          >
            Зарегистрироваться
          </NuxtLink>
        </p>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

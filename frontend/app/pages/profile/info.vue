<script setup lang="ts">
const auth = useAuthStore()
const toast = useToast()

const name = ref('')
const email = ref('')
const phone = ref('')
const company = ref('')
const inn = ref('')
const position = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

watch(
  () => auth.user,
  (user) => {
    if (!user) {
      return
    }
    name.value = user.name
    email.value = user.email
  },
  { immediate: true },
)

function showMockSaveToast() {
  toast.add({
    title: 'Сохранение появится после API',
    color: 'neutral',
  })
}

function handleSaveProfile() {
  showMockSaveToast()
}

function handleChangePassword() {
  showMockSaveToast()
}
</script>

<template>
  <div class="space-y-6">
    <SkmCard
      title="Контактные данные"
      description="Имя, телефон и реквизиты компании для заказов и документов."
    >
      <form
        class="mt-6 space-y-4"
        @submit.prevent="handleSaveProfile"
      >
        <SkmFormField
          label="Email"
          hint="Логин"
        >
          <SkmInput
            v-model="email"
            type="email"
            autocomplete="email"
            disabled
          />
        </SkmFormField>
        <SkmFormField label="Имя">
          <SkmInput
            v-model="name"
            autocomplete="name"
          />
        </SkmFormField>
        <SkmFormField label="Телефон">
          <SkmInput
            v-model="phone"
            type="tel"
            autocomplete="tel"
          />
        </SkmFormField>
        <SkmFormField label="Компания">
          <SkmInput
            v-model="company"
            autocomplete="organization"
          />
        </SkmFormField>
        <SkmFormField label="ИНН">
          <SkmInput v-model="inn" />
        </SkmFormField>
        <SkmFormField label="Должность">
          <SkmInput
            v-model="position"
            autocomplete="organization-title"
          />
        </SkmFormField>
        <SkmButton type="submit">
          Сохранить
        </SkmButton>
      </form>
    </SkmCard>

    <SkmCard title="Смена пароля">
      <form
        class="mt-6 space-y-4"
        @submit.prevent="handleChangePassword"
      >
        <SkmFormField label="Текущий пароль">
          <SkmInput
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
          />
        </SkmFormField>
        <SkmFormField label="Новый пароль">
          <SkmInput
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
          />
        </SkmFormField>
        <SkmFormField label="Повтор нового пароля">
          <SkmInput
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
          />
        </SkmFormField>
        <SkmButton type="submit">
          Изменить пароль
        </SkmButton>
      </form>
    </SkmCard>
  </div>
</template>

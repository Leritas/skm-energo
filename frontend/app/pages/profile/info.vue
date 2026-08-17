<script setup lang="ts">
import type { AuthUserDto, ChangePasswordRequest, UpdateProfileRequest } from '@skm/specs'

const auth = useAuthStore()
const toast = useToast()
const { api } = useApi()

const name = ref('')
const email = ref('')
const phone = ref('')
const company = ref('')
const inn = ref('')
const position = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const savingProfile = ref(false)
const changingPassword = ref(false)

function applyUser(user: AuthUserDto) {
  name.value = user.name
  email.value = user.email
  phone.value = user.phone ?? ''
  company.value = user.company ?? ''
  inn.value = user.inn ?? ''
  position.value = user.position ?? ''
}

watch(
  () => auth.user,
  (user) => {
    if (!user) {
      return
    }
    applyUser(user)
  },
  { immediate: true },
)

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    const body: UpdateProfileRequest = {
      name: name.value.trim(),
      phone: phone.value.trim() || null,
      company: company.value.trim() || null,
      inn: inn.value.trim() || null,
      position: position.value.trim() || null,
    }
    const user = await api<AuthUserDto>('/profile', {
      method: 'PATCH',
      body,
    })
    auth.setUser(user)
    applyUser(user)
    toast.add({
      title: 'Данные сохранены',
      color: 'success',
    })
  }
  catch (error) {
    toast.add({
      title: 'Не удалось сохранить',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    })
  }
  finally {
    savingProfile.value = false
  }
}

async function handleChangePassword() {
  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      title: 'Пароли не совпадают',
      color: 'error',
    })
    return
  }

  changingPassword.value = true
  try {
    const body: ChangePasswordRequest = {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    }
    await api('/profile/change-password', {
      method: 'POST',
      body,
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toast.add({
      title: 'Пароль изменён',
      description: 'Войдите с новым паролем',
      color: 'success',
    })
    await auth.logout()
    await navigateTo('/login')
  }
  catch (error) {
    toast.add({
      title: 'Не удалось сменить пароль',
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    })
  }
  finally {
    changingPassword.value = false
  }
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
            required
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
          <SkmInput
            v-model="inn"
            inputmode="numeric"
          />
        </SkmFormField>
        <SkmFormField label="Должность">
          <SkmInput
            v-model="position"
            autocomplete="organization-title"
          />
        </SkmFormField>
        <SkmButton
          type="submit"
          :disabled="savingProfile"
        >
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
            required
          />
        </SkmFormField>
        <SkmFormField label="Новый пароль">
          <SkmInput
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </SkmFormField>
        <SkmFormField label="Повтор нового пароля">
          <SkmInput
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </SkmFormField>
        <SkmButton
          type="submit"
          :disabled="changingPassword"
        >
          Изменить пароль
        </SkmButton>
      </form>
    </SkmCard>
  </div>
</template>

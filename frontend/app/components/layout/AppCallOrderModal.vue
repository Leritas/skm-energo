<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const name = ref('')
const phone = ref('')
const submitted = ref(false)

function handleSubmit() {
  submitted.value = true
}

function handleClose() {
  open.value = false
  name.value = ''
  phone.value = ''
  submitted.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Заказать звонок">
    <template #body>
      <div v-if="submitted" class="py-4 text-center">
        <p class="text-neutral-600">
          Функция будет доступна на этапе 8 roadmap.
        </p>
        <AppButton class="mt-4" variant="secondary" @click="handleClose">
          Закрыть
        </AppButton>
      </div>
      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <UFormField label="Ваше имя">
          <UInput v-model="name" placeholder="Иван Иванов" required />
        </UFormField>
        <UFormField label="Телефон">
          <UInput
            v-model="phone"
            type="tel"
            placeholder="+7 (___) ___-__-__"
            required
          />
        </UFormField>
        <div class="flex justify-end gap-3 pt-2">
          <AppButton variant="outline" type="button" @click="handleClose">
            Отмена
          </AppButton>
          <AppButton type="submit">Отправить</AppButton>
        </div>
      </form>
    </template>
  </UModal>
</template>

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
        <SkmButton class="mt-4" variant="secondary" @click="handleClose">
          Закрыть
        </SkmButton>
      </div>
      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <SkmFormField label="Ваше имя">
          <SkmInput v-model="name" placeholder="Иван Иванов" required />
        </SkmFormField>
        <SkmFormField label="Телефон">
          <SkmInput
            v-model="phone"
            type="tel"
            placeholder="+7 (___) ___-__-__"
            required
          />
        </SkmFormField>
        <div class="flex justify-end gap-3 pt-2">
          <SkmButton variant="outline" type="button" @click="handleClose">
            Отмена
          </SkmButton>
          <SkmButton type="submit">Отправить</SkmButton>
        </div>
      </form>
    </template>
  </UModal>
</template>


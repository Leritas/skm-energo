<script setup lang="ts">
import SkmButton from '../SkmButton/SkmButton.vue'
import SkmInput from '../SkmInput/SkmInput.vue'

withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  {
    placeholder: 'Поиск…',
  },
)

const model = defineModel<string>({ default: '' })

const emit = defineEmits<{
  submit: [value: string]
}>()

function onSubmit() {
  emit('submit', model.value)
}
</script>

<template>
  <form
    class="flex gap-2"
    @submit.prevent="onSubmit"
  >
    <SkmInput
      v-model="model"
      type="search"
      :placeholder="placeholder"
      class="flex-1"
      aria-label="Поиск"
    />
    <SkmButton
      type="submit"
      variant="primary"
      icon="i-lucide-search"
      aria-label="Найти"
    />
  </form>
</template>

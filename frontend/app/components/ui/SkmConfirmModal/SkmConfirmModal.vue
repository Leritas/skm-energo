<script setup lang="ts">
import SkmButton from '../SkmButton/SkmButton.vue'
import SkmModal from '../SkmModal/SkmModal.vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmTone?: 'primary' | 'danger'
  }>(),
  {
    title: 'Подтвердите действие',
    description: undefined,
    confirmLabel: 'Подтвердить',
    cancelLabel: 'Отмена',
    confirmTone: 'primary',
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function onConfirm() {
  emit('confirm')
  open.value = false
}

function onCancel() {
  emit('cancel')
  open.value = false
}
</script>

<template>
  <SkmModal
    v-model:open="open"
    :title="title"
    :description="description"
  >
    <template #body>
      <slot />
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <SkmButton
          variant="outline"
          @click="onCancel"
        >
          {{ cancelLabel }}
        </SkmButton>
        <SkmButton
          variant="primary"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </SkmButton>
      </div>
    </template>
  </SkmModal>
</template>

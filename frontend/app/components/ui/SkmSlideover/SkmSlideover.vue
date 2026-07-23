<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    side?: 'left' | 'right' | 'top' | 'bottom'
  }>(),
  {
    title: undefined,
    description: undefined,
    side: 'right',
  },
)

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="title"
    :description="description"
    :side="side"
  >
    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps ?? {}"
      />
    </template>
  </USlideover>
</template>

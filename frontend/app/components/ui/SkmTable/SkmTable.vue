<script setup lang="ts">
defineProps<{
  data?: Record<string, unknown>[]
  columns?: Array<{
    accessorKey?: string
    header?: string
    id?: string
  }>
  empty?: string
}>()
</script>

<template>
  <UTable
    :data="data"
    :columns="columns as never"
    :empty="empty ?? 'Нет данных'"
  />
</template>

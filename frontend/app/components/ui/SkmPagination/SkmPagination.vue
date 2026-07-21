<script setup lang="ts">
withDefaults(
  defineProps<{
    total: number
    itemsPerPage?: number
  }>(),
  {
    itemsPerPage: 12,
  },
)

const page = defineModel<number>('page', { default: 1 })
</script>

<template>
  <UPagination
    v-model:page="page"
    :total="total"
    :items-per-page="itemsPerPage"
    color="neutral"
    active-color="primary"
    show-edges
  />
</template>

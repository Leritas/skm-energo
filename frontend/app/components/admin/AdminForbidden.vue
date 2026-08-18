<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: 'Недостаточно прав',
    description:
      'У вашей учётной записи нет доступа к этому разделу админ-панели.',
  },
);
</script>

<template>
  <SkmEmpty
    :title="title"
    :description="description"
    icon="i-lucide-shield-alert"
  >
    <template #actions>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <SkmButton variant="outline" to="/admin"> К обзору </SkmButton>
        <SkmButton variant="ghost" to="/"> На главную </SkmButton>
      </div>
    </template>
  </SkmEmpty>
</template>

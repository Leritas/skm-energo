<script setup lang="ts">
import { useProvidedCheckoutContext } from '~/composables/useCheckoutContext';

withDefaults(
  defineProps<{
    rows?: number;
  }>(),
  {
    rows: 3,
  },
);

const ctx = useProvidedCheckoutContext();
</script>

<template>
  <SkmCard
    title="Комментарий к заказу"
    description="Срок, объект, дополнительные требования — необязательно."
    class="w-full"
  >
    <SkmTextarea
      v-model="ctx.form.customerNote"
      :rows="rows"
      class="mt-4 w-full"
      placeholder="Например: поставка на объект до 15 числа, нужен паспорт на кабель…"
    />
  </SkmCard>
</template>

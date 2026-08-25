<script setup lang="ts">
import { useProvidedCheckoutContext } from '~/composables/useCheckoutContext';

const ctx = useProvidedCheckoutContext();
</script>

<template>
  <p class="text-center text-sm leading-relaxed text-neutral-600">
    {{ ctx.orderPreview.value.orderTypeLabel }}.
    {{ ctx.orderPreview.value.paymentStatusLabel }}.
  </p>
</template>

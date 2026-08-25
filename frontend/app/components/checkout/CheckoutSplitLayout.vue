<script setup lang="ts">
import CheckoutStepper from './CheckoutStepper.vue';

withDefaults(
  defineProps<{
    currentStep?: number;
  }>(),
  {
    currentStep: 1,
  },
);
</script>

<template>
  <CheckoutStepper :current="currentStep" />
  <div
    class="-mx-4 overflow-hidden rounded-2xl border border-neutral-200 lg:-mx-0"
  >
    <div class="grid min-h-[36rem] lg:grid-cols-[42%_1fr]">
      <slot name="left" />
      <slot name="right" />
    </div>
  </div>
</template>

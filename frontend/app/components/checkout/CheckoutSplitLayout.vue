<script setup lang="ts">
import { CHECKOUT_STEPS } from '~/constants/checkout';

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
  <SkmStepper
    :steps="[...CHECKOUT_STEPS]"
    :current="currentStep"
    class="mb-8"
  />
  <div
    class="-mx-4 overflow-hidden rounded-2xl border border-neutral-200 lg:-mx-0"
  >
    <div class="grid min-h-[36rem] lg:grid-cols-[42%_1fr]">
      <slot name="left" />
      <slot name="right" />
    </div>
  </div>
</template>

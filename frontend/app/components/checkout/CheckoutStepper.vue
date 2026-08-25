<script setup lang="ts">
import { CHECKOUT_STEPS } from '~/constants/checkout';

defineProps<{
  current: number;
}>();
</script>

<template>
  <SkmStepper :steps="[...CHECKOUT_STEPS]" :current="current" class="mb-8" />
</template>

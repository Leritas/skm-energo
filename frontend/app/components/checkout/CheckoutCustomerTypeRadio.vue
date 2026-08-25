<script setup lang="ts">
import { CUSTOMER_TYPE_OPTIONS } from '~/utils/customer-type';
import { useProvidedCheckoutContext } from '~/composables/useCheckoutContext';

const ctx = useProvidedCheckoutContext();
</script>

<template>
  <fieldset>
    <legend class="text-sm font-medium text-neutral-900">Тип покупателя</legend>
    <div class="mt-3 grid gap-3 sm:grid-cols-2">
      <label
        v-for="option in CUSTOMER_TYPE_OPTIONS"
        :key="option.value"
        class="flex cursor-pointer gap-3 rounded-lg border px-4 py-3 transition-colors"
        :class="
          ctx.form.customerType === option.value
            ? 'border-brand-purple-600 bg-brand-purple-50'
            : 'border-neutral-200 hover:border-neutral-300'
        "
      >
        <input
          v-model="ctx.form.customerType"
          type="radio"
          class="mt-1"
          :value="option.value"
        />
        <span>
          <span class="block text-sm font-medium text-neutral-900">
            {{ option.label }}
          </span>
          <span class="mt-0.5 block text-xs text-neutral-600">
            {{ option.description }}
          </span>
        </span>
      </label>
    </div>
  </fieldset>
</template>

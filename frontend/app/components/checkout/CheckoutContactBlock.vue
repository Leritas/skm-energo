<script setup lang="ts">
import { useProvidedCheckoutContext } from '~/composables/useCheckoutContext';

const ctx = useProvidedCheckoutContext();
</script>

<template>
  <SkmCard
    title="Контактное лицо"
    description="Кто подаёт заявку и по каким контактам связаться."
  >
    <div class="mt-4 space-y-4">
      <SkmFormField label="Email">
        <SkmInput
          v-model="ctx.form.email"
          type="email"
          autocomplete="email"
          disabled
        />
      </SkmFormField>
      <SkmFormField label="Имя" required>
        <SkmInput v-model="ctx.form.name" autocomplete="name" required />
      </SkmFormField>
      <SkmFormField label="Телефон" required>
        <SkmInput
          v-model="ctx.form.phone"
          type="tel"
          autocomplete="tel"
          required
        />
      </SkmFormField>
    </div>
  </SkmCard>
</template>

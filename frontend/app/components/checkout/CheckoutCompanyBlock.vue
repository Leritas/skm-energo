<script setup lang="ts">
import { useProvidedCheckoutContext } from '~/composables/useCheckoutContext';

const ctx = useProvidedCheckoutContext();
</script>

<template>
  <SkmCard
    title="Данные компании"
    description="Реквизиты для счёта и документов. Обязательны для юридического лица."
  >
    <div class="mt-4 space-y-4">
      <SkmFormField label="Компания" required>
        <SkmInput
          v-model="ctx.form.company"
          autocomplete="organization"
          required
        />
      </SkmFormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <SkmFormField label="ИНН">
          <SkmInput v-model="ctx.form.inn" inputmode="numeric" />
        </SkmFormField>
        <SkmFormField label="Должность">
          <SkmInput
            v-model="ctx.form.position"
            autocomplete="organization-title"
          />
        </SkmFormField>
      </div>
    </div>
  </SkmCard>
</template>

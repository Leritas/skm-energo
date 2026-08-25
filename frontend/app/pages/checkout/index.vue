<script setup lang="ts">
import { SITE } from '~/constants/site';
import CheckoutForm from '~/components/checkout/CheckoutForm.vue';
import { provideCheckoutContext } from '~/composables/useCheckoutContext';

definePageMeta({
  middleware: 'checkout-auth',
});

useSeoMeta({
  title: `Оформление — ${SITE.name}`,
  description: 'Оформление заявки на поставку.',
});

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Корзина', to: '/cart' },
  { label: 'Оформление' },
];

const cart = useCart();
provideCheckoutContext();

await cart.ensureHydrated();

if (cart.isEmpty.value) {
  await navigateTo('/cart');
}
</script>

<template>
  <SkmSection class="pb-24">
    <SkmContainer>
      <SkmPageHeader
        title="Оформление запроса"
        description="Проверьте состав и укажите контактные данные."
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <div
        v-if="cart.hasUnavailable.value"
        class="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      >
        В корзине есть недоступные позиции. Удалите их в
        <NuxtLink to="/cart" class="font-medium underline">корзине</NuxtLink>,
        чтобы продолжить.
      </div>

      <CheckoutForm v-else />
    </SkmContainer>
  </SkmSection>
</template>

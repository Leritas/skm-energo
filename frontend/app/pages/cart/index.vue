<script setup lang="ts">
import CheckoutStepper from '~/components/checkout/CheckoutStepper.vue';
import { SITE } from '~/constants/site';
import { formatCartPriceLabel, formatCartTotalLabel } from '~/utils/cart';

useSeoMeta({
  title: `Корзина — ${SITE.name}`,
  description: 'Корзина запроса поставки.',
});

const route = useRoute();
const breadcrumbs = [{ label: 'Главная', to: '/' }, { label: 'Корзина' }];

const cart = useCart();

await cart.ensureHydrated();

const checkoutErrorMessage = computed(() => {
  const code = route.query.checkoutError;
  if (code === 'empty') {
    return 'Корзина пуста — добавьте товары перед оформлением.';
  }
  if (code === 'unavailable') {
    return 'Некоторые позиции стали недоступны. Удалите их и попробуйте снова.';
  }
  return null;
});

const confirmOpen = ref(false);
const pendingRemoveId = ref<number | null>(null);

function askRemove(productId: number) {
  pendingRemoveId.value = productId;
  confirmOpen.value = true;
}

async function confirmRemove() {
  if (pendingRemoveId.value != null) {
    await cart.removeItem(pendingRemoveId.value);
  }
  pendingRemoveId.value = null;
}

async function onQuantityChange(productId: number, quantity: number) {
  await cart.updateQuantity(productId, quantity);
}

const totalLabel = computed(() => formatCartTotalLabel(cart.items.value));
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <SkmPageHeader
        title="Корзина"
        description="Проверьте позиции перед оформлением заявки."
      >
        <template #breadcrumbs>
          <SkmBreadcrumbs :items="breadcrumbs" />
        </template>
      </SkmPageHeader>

      <SkmAlert
        v-if="checkoutErrorMessage"
        class="mb-6"
        tone="warning"
        :title="checkoutErrorMessage"
      />

      <CheckoutStepper v-if="!cart.isEmpty.value" :current="0" />

      <SkmEmpty
        v-if="cart.isEmpty.value && !cart.loading.value"
        title="Корзина пуста"
        description="Добавьте товары с карточки продукта."
      >
        <template #actions>
          <SkmButton to="/catalog" variant="outline"> В каталог </SkmButton>
        </template>
      </SkmEmpty>

      <div v-else class="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <SkmCartLine
            v-for="line in cart.items.value"
            :key="line.productId"
            :title="line.title"
            :to="`/product/${line.slug}`"
            :image-src="line.photo?.url ?? null"
            :sku="line.sku"
            :price-label="formatCartPriceLabel(line.price)"
            :unavailable="!line.isAvailable"
            :model-value="line.quantity"
            @update:model-value="onQuantityChange(line.productId, $event)"
            @remove="askRemove(line.productId)"
          />
          <p
            v-if="cart.hasUnavailable.value"
            class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Некоторые позиции недоступны. Удалите их, чтобы продолжить
            оформление.
          </p>
        </div>
        <SkmCartSummary
          :lines-count="cart.linesCount.value"
          :total-label="totalLabel"
          :checkout-disabled="cart.hasUnavailable.value"
        />
      </div>

      <SkmConfirmModal
        v-model:open="confirmOpen"
        title="Удалить позицию?"
        description="Товар будет убран из корзины."
        confirm-label="Удалить"
        confirm-tone="danger"
        @confirm="confirmRemove"
      />
    </SkmContainer>
  </SkmSection>
</template>

<script setup lang="ts">
import type { OrderDto } from '@skm/specs';
import { SITE } from '~/constants/site';
import { formatCartPriceLabel } from '~/utils/cart';
import { deriveCheckoutOrderPreview } from '~/utils/checkout-order-preview';

definePageMeta({
  middleware: 'checkout-auth',
});

useSeoMeta({
  title: `Заявка отправлена — ${SITE.name}`,
  description: 'Подтверждение оформления заявки.',
});

const route = useRoute();
const { api } = useApi();

const orderId = computed(() => {
  const raw = route.query.order;
  if (typeof raw !== 'string') {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
});

const order = ref<OrderDto | null>(null);
const loadError = ref(false);

onMounted(async () => {
  if (orderId.value == null) {
    await navigateTo('/cart');
    return;
  }
  try {
    order.value = await api<OrderDto>(`/orders/${orderId.value}`);
  } catch {
    loadError.value = true;
    await navigateTo('/cart');
  }
});

const preview = computed(() => {
  if (!order.value) {
    return null;
  }
  const lines = order.value.lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    title: line.title,
    slug: '',
    sku: line.sku,
    price: line.unitPrice,
    photo: null,
    isAvailable: true,
  }));
  return deriveCheckoutOrderPreview(lines);
});

const totalLabel = computed(() => {
  if (!order.value) {
    return '';
  }
  const priced = order.value.lines.filter((line) => line.unitPrice);
  if (priced.length === 0) {
    return 'по запросу';
  }
  const sum = priced.reduce((acc, line) => {
    return acc + Number.parseFloat(line.unitPrice!) * line.quantity;
  }, 0);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(sum);
});
</script>

<template>
  <SkmSection>
    <SkmContainer>
      <div v-if="order && !loadError" class="mx-auto max-w-2xl text-center">
        <div
          class="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
        >
          ✓
        </div>
        <h1 class="mt-6 text-3xl font-bold text-neutral-950">
          Заявка {{ order.number }} принята
        </h1>
        <p class="mt-3 text-neutral-600">
          Мы отправили подтверждение на {{ order.customerEmail }}. Менеджер
          свяжется с вами по указанным контактам.
        </p>

        <p v-if="preview" class="mt-4 text-sm text-neutral-500">
          {{ preview.orderTypeLabel }}. {{ preview.paymentStatusLabel }}.
        </p>

        <SkmCard class="mt-10 text-left">
          <h2 class="text-lg font-semibold text-neutral-950">Состав заказа</h2>
          <ul class="mt-4 divide-y divide-neutral-100">
            <li
              v-for="line in order.lines"
              :key="line.productId"
              class="flex items-start justify-between gap-4 py-3 text-sm"
            >
              <div>
                <p class="font-medium text-neutral-900">{{ line.title }}</p>
                <p class="font-mono text-xs text-neutral-500">{{ line.sku }}</p>
              </div>
              <div class="text-right tabular-nums text-neutral-700">
                <p>{{ line.quantity }} шт.</p>
                <p class="text-neutral-500">
                  {{ formatCartPriceLabel(line.unitPrice) }}
                </p>
              </div>
            </li>
          </ul>
          <div
            class="mt-4 flex justify-between border-t border-neutral-100 pt-4 text-sm"
          >
            <span class="text-neutral-600">Сумма</span>
            <span class="font-semibold tabular-nums">{{ totalLabel }}</span>
          </div>
        </SkmCard>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <SkmButton to="/catalog" variant="outline">В каталог</SkmButton>
          <SkmButton to="/profile" variant="primary">В профиль</SkmButton>
        </div>
      </div>
    </SkmContainer>
  </SkmSection>
</template>

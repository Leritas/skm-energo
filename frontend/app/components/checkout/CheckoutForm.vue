<script setup lang="ts">
import CheckoutCommentBlock from './CheckoutCommentBlock.vue';
import CheckoutCompanyBlock from './CheckoutCompanyBlock.vue';
import CheckoutContactBlock from './CheckoutContactBlock.vue';
import CheckoutCustomerTypeRadio from './CheckoutCustomerTypeRadio.vue';
import CheckoutOrderSummary from './CheckoutOrderSummary.vue';
import CheckoutSplitLayout from './CheckoutSplitLayout.vue';
import CheckoutSubmitNote from './CheckoutSubmitNote.vue';
import { useProvidedCheckoutContext } from '~/composables/useCheckoutContext';
import { formatCartPriceLabel } from '~/utils/cart';

const cart = useCart();
const ctx = useProvidedCheckoutContext();
</script>

<template>
  <CheckoutSplitLayout>
    <template #left>
      <aside
        class="flex flex-col bg-brand-purple-950 px-6 py-8 text-white sm:px-8"
      >
        <h2 class="text-xl font-semibold tracking-tight">Состав заказа</h2>

        <div class="mt-6 flex-1 overflow-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr
                class="border-b border-white/20 text-xs uppercase tracking-wide text-white/50"
              >
                <th class="pb-2 pr-2 font-medium">Наименование / артикул</th>
                <th class="pb-2 text-right font-medium">Кол.</th>
                <th class="pb-2 pl-2 text-right font-medium">Цена</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in cart.items.value"
                :key="line.productId"
                class="border-b border-white/10"
                :class="!line.isAvailable ? 'opacity-50' : ''"
              >
                <td class="py-2.5 pr-2">
                  <span class="line-clamp-2 font-medium leading-snug">
                    {{ line.title }}
                  </span>
                  <span class="mt-0.5 block font-mono text-xs text-white/50">
                    {{ line.sku }}
                  </span>
                  <span v-if="!line.isAvailable" class="text-xs text-amber-200">
                    недоступен
                  </span>
                </td>
                <td class="py-2.5 text-right tabular-nums align-top">
                  {{ line.quantity }}
                </td>
                <td
                  class="py-2.5 pl-2 text-right tabular-nums align-top whitespace-nowrap"
                >
                  {{ formatCartPriceLabel(line.price) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CheckoutOrderSummary />
      </aside>
    </template>

    <template #right>
      <div class="flex flex-col bg-white px-6 py-8 sm:px-8">
        <h2 class="text-xl font-semibold text-neutral-950">
          Данные покупателя
        </h2>
        <p class="mt-1 text-sm text-neutral-600">
          Снимок фиксируется в заказе на момент отправки.
        </p>

        <form
          class="mt-6 flex flex-1 flex-col gap-6"
          @submit.prevent="ctx.submit()"
        >
          <CheckoutCustomerTypeRadio />
          <CheckoutCompanyBlock v-if="ctx.isLegalEntity.value" />
          <CheckoutContactBlock />
          <CheckoutCommentBlock />

          <div class="mt-auto border-t border-neutral-100 pt-6">
            <CheckoutSubmitNote class="mb-4" />
            <SkmButton
              type="submit"
              class="w-full justify-center"
              variant="primary"
              :disabled="ctx.submitDisabled.value"
            >
              {{ ctx.submitting.value ? 'Отправка…' : 'Отправить запрос' }}
            </SkmButton>
          </div>
        </form>
      </div>
    </template>
  </CheckoutSplitLayout>
</template>

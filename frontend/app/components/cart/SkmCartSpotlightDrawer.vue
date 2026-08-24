<script setup lang="ts">
import { CATALOG_SEARCH_SPOTLIGHT_THEME } from '~/constants/catalog-search-spotlight-theme';
import SkmCartDrawerLine from '~/components/cart/SkmCartDrawerLine.vue';
import { cartPositionsLabel, formatCartTotalLabel } from '~/utils/cart';

const open = defineModel<boolean>('open', { default: false });

const theme = CATALOG_SEARCH_SPOTLIGHT_THEME;
const cart = useCart();

useBodyScrollLock(open);

const positionsLabel = computed(() =>
  cartPositionsLabel(cart.linesCount.value),
);

const totalLabel = computed(() => formatCartTotalLabel(cart.items.value));

function close() {
  open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});

async function onQuantityChange(productId: number, quantity: number) {
  await cart.updateQuantity(productId, quantity);
}

async function onRemove(productId: number) {
  await cart.removeItem(productId);
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[70]" :class="theme.overlayClass">
        <button
          type="button"
          class="absolute inset-0"
          aria-label="Закрыть корзину"
          @click="close"
        />

        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="translate-x-full"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-to-class="translate-x-full"
        >
          <aside
            v-if="open"
            class="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,24rem)] flex-col overflow-hidden bg-white shadow-2xl sm:max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label="Корзина"
          >
            <header
              class="flex min-h-12 shrink-0 items-center gap-3 px-4 py-3"
              :class="theme.inputBarClass"
            >
              <UIcon
                name="i-lucide-shopping-cart"
                :class="['size-5 shrink-0', theme.iconClass]"
              />
              <h2
                class="min-w-0 flex-1 text-base font-semibold leading-tight text-white"
              >
                Корзина
              </h2>
              <button
                type="button"
                :class="[
                  'inline-flex h-8 shrink-0 items-center justify-center rounded px-1.5 text-[10px] leading-none transition',
                  theme.kbdClass,
                  theme.closeBtnClass,
                ]"
                aria-label="Закрыть (Esc)"
                @click="close"
              >
                Esc
              </button>
            </header>

            <div
              class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              :class="theme.bodyClass"
            >
              <p
                v-if="cart.isEmpty.value"
                class="px-4 py-12 text-center text-sm text-neutral-500"
              >
                Корзина пуста
              </p>

              <div v-else class="px-4 pb-2">
                <SkmCartDrawerLine
                  v-for="line in cart.items.value"
                  :key="line.productId"
                  :line="line"
                  :model-value="line.quantity"
                  @update:model-value="onQuantityChange(line.productId, $event)"
                  @remove="onRemove(line.productId)"
                />
                <p
                  v-if="cart.hasUnavailable.value"
                  class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                >
                  Удалите недоступные позиции перед оформлением
                </p>
              </div>
            </div>

            <footer :class="['shrink-0', theme.footerClass]">
              <div
                class="flex items-center justify-between px-4 py-2.5 text-xs"
              >
                <span :class="theme.footerTextClass">
                  {{ cart.linesCount.value }} {{ positionsLabel }}
                </span>
                <span class="font-medium tabular-nums text-neutral-950">
                  {{ cart.totalQuantity.value }} шт.
                </span>
              </div>
              <div class="border-t border-neutral-200 px-4 py-3">
                <div class="mb-3 flex items-baseline justify-between">
                  <span class="text-xs text-neutral-500">Сумма</span>
                  <span class="text-sm font-semibold text-neutral-950">
                    {{ totalLabel }}
                  </span>
                </div>
                <SkmButton
                  class="w-full justify-center"
                  variant="primary"
                  :to="cart.hasUnavailable.value ? undefined : '/checkout'"
                  :disabled="cart.hasUnavailable.value || cart.isEmpty.value"
                >
                  Оформить
                </SkmButton>
              </div>
            </footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

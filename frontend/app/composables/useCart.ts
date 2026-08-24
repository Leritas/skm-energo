import { useDebounceFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import {
  cartHasPricedItems,
  cartPositionsLabel,
  formatCartPriceLabel,
  formatCartTotalLabel,
} from '~/utils/cart';

export function useCart() {
  const store = useCartStore();
  const {
    items,
    loading,
    hydrated,
    linesCount,
    totalQuantity,
    hasUnavailable,
    isEmpty,
    drawerOpen,
  } = storeToRefs(store);

  const updateQuantityDebounced = useDebounceFn(
    (productId: number, quantity: number) =>
      store.updateQuantity(productId, quantity),
    400,
  );

  return {
    items,
    loading,
    hydrated,
    linesCount,
    totalQuantity,
    hasUnavailable,
    isEmpty,
    drawerOpen,
    cartPositionsLabel,
    formatCartPriceLabel,
    formatCartTotalLabel,
    cartHasPricedItems,
    lineByProductId: (productId: number) => store.lineByProductId(productId),
    fetchCart: () => store.fetchCart(),
    ensureHydrated: () => store.ensureHydrated(),
    addItem: (productId: number, quantity: number) =>
      store.addItem(productId, quantity),
    updateQuantity: (productId: number, quantity: number) =>
      updateQuantityDebounced(productId, quantity),
    removeItem: (productId: number) => store.removeItem(productId),
    openDrawer: () => store.openDrawer(),
    closeDrawer: () => store.closeDrawer(),
  };
}

import type {
  AddCartItemRequest,
  CartDto,
  CartLineDto,
  UpdateCartItemRequest,
} from '@skm/specs';
import { defineStore } from 'pinia';

function cartUsesAuth(): boolean {
  const auth = useAuthStore();
  return Boolean(auth.accessToken);
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartLineDto[],
    loading: false,
    hydrated: false,
    drawerOpen: false,
  }),

  getters: {
    linesCount: (state) => state.items.length,
    totalQuantity: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
    hasUnavailable: (state) => state.items.some((item) => !item.isAvailable),
    isEmpty: (state) => state.items.length === 0,
    lineByProductId:
      (state) =>
      (productId: number): CartLineDto | undefined =>
        state.items.find((item) => item.productId === productId),
  },

  actions: {
    setCart(cart: CartDto) {
      this.items = cart.items;
      this.hydrated = true;
    },

    invalidate() {
      this.hydrated = false;
    },

    async fetchCart() {
      const { api } = useApi();
      this.loading = true;
      try {
        const cart = await api<CartDto>('/cart', { auth: cartUsesAuth() });
        this.setCart(cart);
      } catch {
        this.items = [];
        this.hydrated = true;
      } finally {
        this.loading = false;
      }
    },

    async ensureHydrated() {
      if (!this.hydrated && !this.loading) {
        await this.fetchCart();
      }
    },

    async addItem(productId: number, quantity: number) {
      const { api } = useApi();
      const body: AddCartItemRequest = { productId, quantity };
      const cart = await api<CartDto>('/cart/items', {
        method: 'POST',
        body,
        auth: cartUsesAuth(),
      });
      this.setCart(cart);
    },

    async updateQuantity(productId: number, quantity: number) {
      const { api } = useApi();
      const body: UpdateCartItemRequest = { quantity };
      const cart = await api<CartDto>(`/cart/items/${productId}`, {
        method: 'PATCH',
        body,
        auth: cartUsesAuth(),
      });
      this.setCart(cart);
    },

    async removeItem(productId: number) {
      const { api } = useApi();
      const cart = await api<CartDto>(`/cart/items/${productId}`, {
        method: 'DELETE',
        auth: cartUsesAuth(),
      });
      this.setCart(cart);
    },

    openDrawer() {
      this.drawerOpen = true;
    },

    closeDrawer() {
      this.drawerOpen = false;
    },
  },
});

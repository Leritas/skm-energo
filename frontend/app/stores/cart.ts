import type {
  AddCartItemRequest,
  CartDto,
  CartLineDto,
  UpdateCartItemRequest,
} from '@skm/specs';
import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartLineDto[],
    loading: false,
    hydrated: false,
  }),

  getters: {
    linesCount: (state) => state.items.length,
    totalQuantity: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
    hasUnavailable: (state) => state.items.some((item) => !item.isAvailable),
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    setCart(cart: CartDto) {
      this.items = cart.items;
      this.hydrated = true;
    },

    async fetchCart() {
      const { api } = useApi();
      this.loading = true;
      try {
        const cart = await api<CartDto>('/cart', { auth: false });
        this.setCart(cart);
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
        auth: false,
      });
      this.setCart(cart);
    },

    async updateQuantity(productId: number, quantity: number) {
      const { api } = useApi();
      const body: UpdateCartItemRequest = { quantity };
      const cart = await api<CartDto>(`/cart/items/${productId}`, {
        method: 'PATCH',
        body,
        auth: false,
      });
      this.setCart(cart);
    },

    async removeItem(productId: number) {
      const { api } = useApi();
      const cart = await api<CartDto>(`/cart/items/${productId}`, {
        method: 'DELETE',
        auth: false,
      });
      this.setCart(cart);
    },
  },
});

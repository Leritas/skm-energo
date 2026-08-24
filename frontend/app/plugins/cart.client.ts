export default defineNuxtPlugin(() => {
  const cart = useCartStore();
  const router = useRouter();

  void cart.fetchCart();

  router.afterEach(() => {
    void cart.fetchCart();
  });
});

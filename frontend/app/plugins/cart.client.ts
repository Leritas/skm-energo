export default defineNuxtPlugin(async () => {
  const cart = useCartStore();
  const router = useRouter();

  await cart.fetchCart();

  router.afterEach(() => {
    void cart.fetchCart();
  });
});

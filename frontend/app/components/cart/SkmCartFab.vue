<script setup lang="ts">
import SkmCartBadge from '~/components/cart/SkmCartBadge.vue';
import SkmCartSpotlightDrawer from '~/components/cart/SkmCartSpotlightDrawer.vue';

const drawerOpen = ref(false);
const cart = useCart();
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="translate-y-2 opacity-0 scale-95"
    leave-active-class="transition-all duration-150 ease-in"
    leave-to-class="translate-y-2 opacity-0 scale-95"
  >
    <div
      v-if="!drawerOpen && cart.linesCount.value > 0"
      class="fixed bottom-5 right-4 z-40 sm:bottom-6 sm:right-6"
    >
      <button
        type="button"
        class="relative flex size-[3.25rem] items-center justify-center rounded-full bg-accent-500 text-white shadow-lg shadow-accent-500/25 transition hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/30 active:scale-95"
        aria-label="Открыть корзину"
        :aria-expanded="drawerOpen"
        @click="drawerOpen = true"
      >
        <UIcon name="i-lucide-shopping-cart" class="size-[1.35rem]" />
        <SkmCartBadge
          :count="cart.linesCount.value"
          size="md"
          badge-class="bg-white ring-2 ring-accent-500"
          text-class="text-accent-600"
        />
      </button>
    </div>
  </Transition>

  <SkmCartSpotlightDrawer v-model:open="drawerOpen" />
</template>

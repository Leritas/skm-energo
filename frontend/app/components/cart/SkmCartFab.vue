<script setup lang="ts">
import { storeToRefs } from 'pinia';
import SkmCartBadge from '~/components/cart/SkmCartBadge.vue';
import SkmCartSpotlightDrawer from '~/components/cart/SkmCartSpotlightDrawer.vue';

const store = useCartStore();
const { items, drawerOpen: drawerOpenRef } = storeToRefs(store);

const drawerOpen = computed({
  get: () => drawerOpenRef.value,
  set: (value: boolean) => {
    if (value) {
      store.openDrawer();
    } else {
      store.closeDrawer();
    }
  },
});

const hasItems = computed(() => items.value.length > 0);
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="translate-y-2 opacity-0 scale-95"
    leave-active-class="transition-all duration-150 ease-in"
    leave-to-class="translate-y-2 opacity-0 scale-95"
  >
    <div
      v-if="!drawerOpen"
      class="fixed bottom-5 right-4 z-40 sm:bottom-6 sm:right-6"
    >
      <button
        type="button"
        class="relative flex size-[3.25rem] items-center justify-center rounded-full border-2 border-accent-500 bg-white text-accent-600 shadow-lg shadow-neutral-200/60 transition hover:bg-accent-50 hover:shadow-neutral-300/70 active:scale-95"
        aria-label="Открыть корзину"
        :aria-expanded="drawerOpen"
        @click="drawerOpen = true"
      >
        <UIcon name="i-lucide-shopping-cart" class="size-[1.35rem]" />
        <SkmCartBadge
          v-if="hasItems"
          :count="items.length"
          size="md"
          badge-class="bg-accent-500"
          text-class="text-white"
        />
      </button>
    </div>
  </Transition>

  <SkmCartSpotlightDrawer v-model:open="drawerOpen" />
</template>

<script setup lang="ts">
import type { CartLineDto } from '@skm/specs';
import SkmCatalogSearchSkuCopy from '~/components/catalog/search/SkmCatalogSearchSkuCopy.vue';
import { formatCartPriceLabel } from '~/utils/cart';

defineProps<{
  line: CartLineDto;
}>();

const qty = defineModel<number>({ required: true });

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <article
    class="flex gap-3 border-b border-neutral-100 py-3 last:border-b-0"
    :class="!line.isAvailable ? 'bg-amber-50/40 -mx-4 px-4' : ''"
  >
    <div
      class="size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:size-16"
    >
      <SkmProductMedia
        :src="line.photo?.url ?? null"
        :alt="line.title"
        aspect="1/1"
      />
    </div>

    <div class="min-w-0 flex-1">
      <NuxtLink
        :to="`/product/${line.slug}`"
        class="line-clamp-2 text-sm font-semibold leading-snug text-neutral-950 hover:text-accent-600"
      >
        {{ line.title }}
      </NuxtLink>

      <div class="mt-1.5 flex items-end justify-between gap-2">
        <div class="min-w-0">
          <SkmCatalogSearchSkuCopy :sku="line.sku" />
          <p class="mt-0.5 text-xs font-medium text-neutral-700">
            {{ formatCartPriceLabel(line.price) }}
          </p>
          <p
            v-if="!line.isAvailable"
            class="mt-1 text-xs font-medium text-amber-700"
          >
            Недоступен
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-0.5">
          <SkmQtyInput v-model="qty" />
          <SkmButton
            variant="ghost"
            size="sm"
            icon="i-lucide-trash-2"
            aria-label="Удалить"
            @click="emit('remove')"
          />
        </div>
      </div>
    </div>
  </article>
</template>

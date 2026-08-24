<script setup lang="ts">
import SkmCatalogSearchSkuCopy from '~/components/catalog/search/SkmCatalogSearchSkuCopy.vue';
import SkmButton from '../SkmButton/SkmButton.vue';
import SkmProductMedia from '../SkmProductMedia/SkmProductMedia.vue';
import SkmQtyInput from '../SkmQtyInput/SkmQtyInput.vue';

withDefaults(
  defineProps<{
    title: string;
    to?: string;
    imageSrc?: string | null;
    sku?: string;
    priceLabel?: string;
    unavailable?: boolean;
    compact?: boolean;
  }>(),
  {
    to: undefined,
    imageSrc: null,
    sku: undefined,
    priceLabel: 'Цена по запросу',
    unavailable: false,
    compact: false,
  },
);

const qty = defineModel<number>({ default: 1 });

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <div
    class="flex gap-4 border-b border-neutral-100 py-4"
    :class="unavailable ? 'bg-amber-50/40 -mx-4 px-4' : ''"
  >
    <div
      class="shrink-0 overflow-hidden rounded-lg bg-neutral-100"
      :class="compact ? 'size-14 sm:size-16' : 'w-20 sm:w-24'"
    >
      <SkmProductMedia :src="imageSrc" :alt="title" aspect="1/1" />
    </div>

    <div class="min-w-0 flex-1">
      <component
        :is="to ? 'NuxtLink' : 'h3'"
        :to="to"
        class="text-base font-semibold text-neutral-950"
        :class="[
          to ? 'hover:text-accent-600' : '',
          compact ? 'line-clamp-2 text-sm leading-snug' : '',
        ]"
      >
        {{ title }}
      </component>

      <div
        class="flex items-end justify-between gap-2"
        :class="compact ? 'mt-1.5' : 'mt-2'"
      >
        <div class="min-w-0">
          <SkmCatalogSearchSkuCopy v-if="sku" :sku="sku" />
          <p
            class="text-sm text-neutral-600"
            :class="
              compact ? 'mt-0.5 text-xs font-medium text-neutral-700' : 'mt-2'
            "
          >
            {{ priceLabel }}
          </p>
          <p v-if="unavailable" class="mt-1 text-xs font-medium text-amber-700">
            Недоступен
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-0.5">
          <slot name="qty">
            <SkmQtyInput v-model="qty" />
          </slot>
          <SkmButton
            variant="ghost"
            size="sm"
            :icon="compact ? 'i-lucide-trash-2' : undefined"
            :aria-label="compact ? 'Удалить' : undefined"
            @click="emit('remove')"
          >
            <template v-if="!compact"> Удалить </template>
          </SkmButton>
        </div>
      </div>
    </div>
  </div>
</template>

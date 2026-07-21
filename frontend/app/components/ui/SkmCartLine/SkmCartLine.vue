<script setup lang="ts">
import SkmButton from '../SkmButton/SkmButton.vue'
import SkmProductMedia from '../SkmProductMedia/SkmProductMedia.vue'
import SkmQtyInput from '../SkmQtyInput/SkmQtyInput.vue'

withDefaults(
  defineProps<{
    title: string
    to?: string
    imageSrc?: string | null
    sku?: string
    priceLabel?: string
    quantity?: number
  }>(),
  {
    to: undefined,
    imageSrc: null,
    sku: undefined,
    priceLabel: 'по запросу',
    quantity: 1,
  },
)

const qty = defineModel<number>('quantity', { default: 1 })

const emit = defineEmits<{
  remove: []
}>()
</script>

<template>
  <div class="flex gap-4 border-b border-neutral-100 py-4">
    <div class="w-20 shrink-0 sm:w-24">
      <SkmProductMedia
        :src="imageSrc"
        :alt="title"
        aspect="1/1"
      />
    </div>
    <div class="min-w-0 flex-1">
      <component
        :is="to ? 'NuxtLink' : 'h3'"
        :to="to"
        class="text-base font-semibold text-neutral-950"
        :class="to ? 'hover:text-accent-600' : ''"
      >
        {{ title }}
      </component>
      <p
        v-if="sku"
        class="mt-0.5 text-xs text-neutral-500"
      >
        Арт. {{ sku }}
      </p>
      <p class="mt-2 text-sm text-neutral-600">
        {{ priceLabel }}
      </p>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <slot name="qty">
          <SkmQtyInput v-model="qty" />
        </slot>
        <SkmButton
          variant="ghost"
          size="sm"
          @click="emit('remove')"
        >
          Удалить
        </SkmButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SkmBadge from '../SkmBadge/SkmBadge.vue'
import SkmProductMedia from '../SkmProductMedia/SkmProductMedia.vue'
import type { SkmBadgeTone } from '../SkmBadge/types'
import type { SkmProductCardBadge, SkmProductCardProps } from './types'

const props = withDefaults(defineProps<SkmProductCardProps>(), {
  imageSrc: null,
  imageAlt: undefined,
  manufacturer: undefined,
  sku: undefined,
  badges: () => [],
  density: 'grid',
})

const badgeLabel = (badge: SkmProductCardBadge): string => {
  switch (badge) {
    case 'pdf':
      return 'PDF'
    case 'onRequest':
      return 'Под заказ'
    case 'new':
      return 'Новинка'
    default: {
      const _exhaustive: never = badge
      return _exhaustive
    }
  }
}

const badgeTone = (badge: SkmProductCardBadge): SkmBadgeTone => {
  switch (badge) {
    case 'pdf':
      return 'neutral'
    case 'onRequest':
      return 'warning'
    case 'new':
      return 'accent'
    default: {
      const _exhaustive: never = badge
      return _exhaustive
    }
  }
}

const isList = computed(() => props.density === 'list')
</script>

<template>
  <NuxtLink
    :to="to"
    class="group block overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    :class="isList ? 'flex gap-4 p-4' : ''"
  >
    <div
      class="relative"
      :class="isList ? 'w-32 shrink-0 sm:w-40' : ''"
    >
      <slot name="media">
        <SkmProductMedia
          :src="imageSrc"
          :alt="imageAlt ?? title"
          :aspect="isList ? '1/1' : '4/3'"
          :class="isList ? 'rounded-lg' : 'rounded-none rounded-t-xl'"
        />
      </slot>
      <div
        v-if="badges.length"
        class="absolute left-2 top-2 flex flex-wrap gap-1"
      >
        <SkmBadge
          v-for="badge in badges"
          :key="badge"
          :label="badgeLabel(badge)"
          :tone="badgeTone(badge)"
          size="sm"
        />
      </div>
    </div>

    <div
      class="flex flex-1 flex-col"
      :class="isList ? 'min-w-0 py-0.5' : 'p-4'"
    >
      <p
        v-if="manufacturer"
        class="text-xs font-medium uppercase tracking-wide text-accent-600"
      >
        {{ manufacturer }}
      </p>
      <h3
        class="text-base font-semibold text-neutral-950 group-hover:text-accent-600"
        :class="manufacturer ? 'mt-1' : ''"
      >
        {{ title }}
      </h3>
      <p
        v-if="sku"
        class="mt-1 text-xs text-neutral-500"
      >
        Артикул: {{ sku }}
      </p>
      <div v-if="$slots.meta" class="mt-2">
        <slot name="meta" />
      </div>
      <div
        class="mt-auto flex items-center justify-between pt-3"
      >
        <slot name="actions">
          <span class="text-sm font-medium text-accent-600">
            Подробнее →
          </span>
        </slot>
      </div>
    </div>
  </NuxtLink>
</template>

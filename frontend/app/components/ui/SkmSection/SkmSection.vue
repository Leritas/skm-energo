<script setup lang="ts">
import { computed } from 'vue'

type SkmSectionTone = 'light' | 'muted' | 'brand'

const props = withDefaults(
  defineProps<{
    tone?: SkmSectionTone
    /** Секция с фиолетовым фоном бренда */
    alt?: boolean
  }>(),
  {
    tone: 'light',
    alt: false,
  },
)

const sectionClass = computed(() => {
  if (props.alt || props.tone === 'brand') {
    return 'bg-brand-purple-950'
  }
  if (props.tone === 'muted') {
    return 'bg-neutral-50'
  }
  return 'bg-white'
})
</script>

<template>
  <section class="py-12 md:py-16" :class="sectionClass">
    <slot />
  </section>
</template>


<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SkmProductMediaAspect } from './types'

const props = withDefaults(
  defineProps<{
    src?: string | null
    alt: string
    aspect?: SkmProductMediaAspect
  }>(),
  {
    src: null,
    aspect: '4/3',
  },
)

const hasError = ref(false)

watch(
  () => props.src,
  () => {
    hasError.value = false
  },
)

const showPlaceholder = computed(() => !props.src || hasError.value)

const aspectClass = computed(() => {
  switch (props.aspect) {
    case '4/3':
      return 'aspect-[4/3]'
    case '1/1':
      return 'aspect-square'
    default: {
      const _exhaustive: never = props.aspect
      return _exhaustive
    }
  }
})
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-lg bg-neutral-100"
    :class="aspectClass"
  >
    <img
      v-if="!showPlaceholder"
      :src="src!"
      :alt="alt"
      class="size-full object-cover"
      @error="hasError = true"
    >
    <div
      v-else
      class="flex size-full items-center justify-center text-neutral-300"
      role="img"
      :aria-label="alt"
    >
      <UIcon name="i-lucide-image" class="size-10" />
    </div>
  </div>
</template>

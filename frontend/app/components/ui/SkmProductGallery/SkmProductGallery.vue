<script setup lang="ts">
import { computed, ref } from 'vue'
import SkmProductMedia from '../SkmProductMedia/SkmProductMedia.vue'

const props = withDefaults(
  defineProps<{
    images?: Array<{ src: string; alt?: string }>
    alt?: string
  }>(),
  {
    images: () => [],
    alt: 'Фото товара',
  },
)

const activeIndex = ref(0)

const active = computed(() => props.images[activeIndex.value] ?? null)
</script>

<template>
  <div class="space-y-3">
    <SkmProductMedia
      :src="active?.src"
      :alt="active?.alt ?? alt"
      aspect="4/3"
    />
    <div
      v-if="images.length > 1"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="(image, index) in images"
        :key="image.src + index"
        type="button"
        class="size-16 overflow-hidden rounded-md border transition-colors"
        :class="
          index === activeIndex
            ? 'border-accent-500 ring-1 ring-accent-500'
            : 'border-neutral-200 hover:border-neutral-300'
        "
        @click="activeIndex = index"
      >
        <SkmProductMedia
          :src="image.src"
          :alt="image.alt ?? alt"
          aspect="1/1"
          class="rounded-none"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    alt?: boolean
  }>(),
  {
    alt: false,
  },
)
</script>

<template>
  <section
    class="py-12 md:py-16"
    :class="alt ? 'bg-neutral-50' : 'bg-white'"
  >
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    count: number;
    size?: 'sm' | 'md';
    badgeClass?: string;
    textClass?: string;
  }>(),
  {
    size: 'sm',
    badgeClass: 'bg-accent-500',
    textClass: 'text-white',
  },
);
</script>

<template>
  <span
    v-if="count > 0"
    class="absolute flex items-center justify-center rounded-full font-semibold"
    :class="[
      badgeClass,
      textClass,
      size === 'sm'
        ? '-right-1.5 -top-1.5 size-4 text-[10px]'
        : '-right-2 -top-2 size-5 text-xs',
    ]"
  >
    {{ count }}
  </span>
</template>

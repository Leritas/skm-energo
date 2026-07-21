<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    to: string
    description?: string
    image?: string | null
  }>(),
  {
    description: undefined,
    image: null,
  },
)
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
  >
    <div
      v-if="image"
      class="aspect-[4/3] overflow-hidden bg-neutral-100"
    >
      <img
        :src="image"
        :alt="title"
        class="size-full object-cover"
      >
    </div>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="text-lg font-semibold text-neutral-950 group-hover:text-accent-600">
        {{ title }}
      </h3>
      <p
        v-if="description"
        class="mt-2 text-sm leading-relaxed text-neutral-600"
      >
        {{ description }}
      </p>
    </div>
  </NuxtLink>
</template>

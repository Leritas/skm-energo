<script setup lang="ts">
defineProps<{
  title: string;
  to: string;
  coverUrl?: string | null;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="group overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
  >
    <div class="aspect-[4/3] overflow-hidden bg-neutral-100">
      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="title"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <div
        v-else
        class="flex size-full items-center justify-center text-neutral-300"
      >
        <UIcon name="i-lucide-layers" class="size-10" />
      </div>
    </div>
    <div class="p-4">
      <h3
        class="text-base font-semibold text-neutral-950 group-hover:text-accent-600"
      >
        {{ title }}
      </h3>
    </div>
  </NuxtLink>
</template>

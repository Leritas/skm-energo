<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div
    class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
  >
    <h1 class="text-2xl font-bold text-neutral-900">
      {{ title }}
    </h1>
    <p class="mt-2 max-w-2xl text-neutral-600">
      {{ description }}
    </p>
    <SkmAlert
      class="mt-6"
      tone="neutral"
      title="Раздел в разработке"
      description="Полный CRUD и рабочие экраны появятся на следующих этапах roadmap."
      icon="i-lucide-construction"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variantLabel: string;
  stateSummary: string;
}>();
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Fake header — dropdown evaluation context -->
    <header class="border-b border-neutral-100 bg-white">
      <SkmContainer>
        <div class="flex h-16 items-center justify-between gap-4 md:h-20">
          <div class="flex shrink-0 items-center gap-8">
            <div
              class="flex h-9 w-28 items-center justify-center rounded bg-neutral-100 text-xs font-medium text-neutral-400 md:h-10"
            >
              LOGO
            </div>
            <nav class="hidden items-center gap-5 md:flex">
              <span class="text-sm font-medium text-accent-600"
                >Продукция ▾</span
              >
              <span class="text-sm font-medium text-neutral-700"
                >О компании</span
              >
              <span class="text-sm font-medium text-neutral-700">Контакты</span>
            </nav>
          </div>
          <div class="hidden items-center gap-2 md:flex">
            <div class="size-9 rounded-full bg-neutral-100" />
            <div class="size-9 rounded-full bg-neutral-100" />
          </div>
        </div>
      </SkmContainer>
    </header>

    <!-- Dropdown panel mount -->
    <div class="relative">
      <SkmContainer>
        <div class="relative pt-2">
          <slot />
        </div>
      </SkmContainer>
    </div>

    <!-- Dimmed page body hint -->
    <div class="pointer-events-none mt-8 opacity-40">
      <SkmContainer>
        <div class="space-y-4">
          <div class="h-8 w-64 rounded bg-neutral-200" />
          <div class="h-4 w-full max-w-2xl rounded bg-neutral-200" />
          <div class="h-4 w-full max-w-xl rounded bg-neutral-200" />
          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <div
              v-for="index in 3"
              :key="index"
              class="aspect-[4/3] rounded-lg bg-neutral-200"
            />
          </div>
        </div>
      </SkmContainer>
    </div>

    <!-- State surface -->
    <div
      class="fixed bottom-24 left-4 z-40 max-w-xs rounded-lg border border-neutral-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm"
    >
      <p class="font-semibold text-neutral-900">{{ variantLabel }}</p>
      <p class="mt-1 font-mono text-neutral-600">{{ stateSummary }}</p>
    </div>
  </div>
</template>

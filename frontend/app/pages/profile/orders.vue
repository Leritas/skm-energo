<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Активные', to: '/profile/orders/active' },
  { label: 'Завершённые', to: '/profile/orders/completed' },
  { label: 'Вы покупали', to: '/profile/orders/purchased' },
] as const
</script>

<template>
  <div>
    <nav class="mb-6 flex gap-1 overflow-x-auto border-b border-neutral-100 pb-2">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium"
        :class="
          route.path === tab.to
            ? 'bg-accent-50 text-accent-700'
            : 'text-neutral-600 hover:bg-neutral-50'
        "
      >
        {{ tab.label }}
      </NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { navItems } = useAdminSections();

function isActive(match: string) {
  if (match === '/admin') {
    return route.path === '/admin';
  }
  return route.path === match || route.path.startsWith(`${match}/`);
}
</script>

<template>
  <aside
    class="flex w-full shrink-0 flex-col border-b border-neutral-200 bg-neutral-50 lg:w-56 lg:border-b-0 lg:border-r"
  >
    <nav
      class="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible lg:p-4"
    >
      <NuxtLink
        v-for="item in navItems"
        :key="item.id"
        :to="item.to"
        class="inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="
          isActive(item.match)
            ? 'bg-white text-accent-700 shadow-sm ring-1 ring-neutral-200'
            : 'text-neutral-700 hover:bg-white/80 hover:text-neutral-900'
        "
      >
        <UIcon :name="item.icon" class="size-4 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>

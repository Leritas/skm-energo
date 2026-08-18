<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'admin',
});

const auth = useAuthStore();
const route = useRoute();

const standalone = computed(() => Boolean(route.meta.adminStandalone));

onMounted(async () => {
  if (!auth.hydrated) {
    auth.hydrate();
  }
  if (auth.accessToken) {
    try {
      await auth.fetchMe();
    } catch {
      auth.clearSession();
      await navigateTo('/login');
    }
  }
});
</script>

<template>
  <AdminShell v-if="!standalone">
    <NuxtPage />
  </AdminShell>
  <NuxtPage v-else />
</template>

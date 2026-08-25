export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  const auth = useAuthStore();
  if (!auth.hydrated) {
    auth.hydrate();
  }

  if (!auth.accessToken) {
    return navigateTo({
      path: '/login',
      query: { returnTo: to.fullPath },
    });
  }

  if (!auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      auth.clearSession();
      return navigateTo({
        path: '/login',
        query: { returnTo: to.fullPath },
      });
    }
  }
});

import { Permission } from '@skm/specs'

export default defineNuxtRouteMiddleware(async () => {
  // Tokens live in localStorage (client-only Bearer auth), so this check
  // cannot run on the server — doing so would redirect on every refresh.
  if (import.meta.server) {
    return
  }

  const auth = useAuthStore()
  if (!auth.hydrated) {
    auth.hydrate()
  }

  if (!auth.accessToken) {
    return navigateTo('/login')
  }

  if (!auth.user) {
    try {
      await auth.fetchMe()
    }
    catch {
      auth.clearSession()
      return navigateTo('/login')
    }
  }

  const { hasPermission } = usePermissions()
  if (!hasPermission(Permission.hasAccessToAdmin)) {
    return navigateTo('/')
  }
})

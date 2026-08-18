import type { AdminSectionId } from '~/constants/admin-sections';
import { canAccessAdminSection } from '~/constants/admin-sections';

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return;
  }

  const sectionId = to.meta.adminSection as AdminSectionId | undefined;
  if (!sectionId) {
    return;
  }

  const auth = useAuthStore();
  if (!canAccessAdminSection(auth.permissions, sectionId)) {
    return navigateTo({
      path: '/admin/access-denied',
      query: { section: sectionId },
    });
  }
});

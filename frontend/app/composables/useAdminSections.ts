import {
  canAccessAdminSection,
  getAccessibleAdminNav,
  type AdminSectionId,
} from '~/constants/admin-sections';

export function useAdminSections() {
  const auth = useAuthStore();

  const permissions = computed(() => auth.permissions);

  const navItems = computed(() => getAccessibleAdminNav(permissions.value));

  function canAccessSection(sectionId: AdminSectionId) {
    return canAccessAdminSection(permissions.value, sectionId);
  }

  return {
    navItems,
    canAccessSection,
  };
}

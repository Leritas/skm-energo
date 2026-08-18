import {
  hasPermission,
  Permission,
  type Permission as PermissionType,
} from '@skm/specs';

export type AdminSectionId = 'dashboard' | 'catalog' | 'news' | 'users';

export interface AdminNavItem {
  id: AdminSectionId;
  label: string;
  to: string;
  icon: string;
  match: string;
}

function hasAnyPermission(
  userPermissions: readonly string[],
  required: readonly PermissionType[],
): boolean {
  return required.some((permission) =>
    hasPermission(userPermissions, permission),
  );
}

const CATALOG_PERMISSIONS = [
  Permission.canCreateItems,
  Permission.canManageItems,
] as const;

const USERS_PERMISSIONS = [
  Permission.canCreateUsers,
  Permission.canDeleteUsers,
  Permission.canManageUserRoles,
  Permission.canCreateRoles,
  Permission.canManageRoles,
] as const;

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Обзор',
    to: '/admin',
    icon: 'i-lucide-layout-dashboard',
    match: '/admin',
  },
  {
    id: 'catalog',
    label: 'Каталог',
    to: '/admin/catalog',
    icon: 'i-lucide-package',
    match: '/admin/catalog',
  },
  {
    id: 'news',
    label: 'Новости',
    to: '/admin/news',
    icon: 'i-lucide-newspaper',
    match: '/admin/news',
  },
  {
    id: 'users',
    label: 'Пользователи',
    to: '/admin/users',
    icon: 'i-lucide-users',
    match: '/admin/users',
  },
] as const;

export function canAccessAdminSection(
  userPermissions: readonly string[],
  sectionId: AdminSectionId,
): boolean {
  switch (sectionId) {
    case 'dashboard':
      return hasPermission(userPermissions, Permission.hasAccessToAdmin);
    case 'catalog':
      return hasAnyPermission(userPermissions, CATALOG_PERMISSIONS);
    case 'news':
      return hasPermission(userPermissions, Permission.hasAccessToNews);
    case 'users':
      return hasAnyPermission(userPermissions, USERS_PERMISSIONS);
    default: {
      const _exhaustive: never = sectionId;
      return _exhaustive;
    }
  }
}

export function getAccessibleAdminNav(
  userPermissions: readonly string[],
): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) =>
    canAccessAdminSection(userPermissions, item.id),
  );
}

export function getAdminSectionLabel(sectionId: AdminSectionId): string {
  const item = ADMIN_NAV_ITEMS.find((entry) => entry.id === sectionId);
  return item?.label ?? sectionId;
}

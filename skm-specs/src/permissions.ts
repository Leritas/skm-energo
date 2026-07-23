export const Permission = {
  hasAbsoluteControl: 'hasAbsoluteControl',
  hasAccessToAdmin: 'hasAccessToAdmin',
  canCreateRoles: 'canCreateRoles',
  canManageRoles: 'canManageRoles',
  canCreateUsers: 'canCreateUsers',
  canDeleteUsers: 'canDeleteUsers',
  canManageUserRoles: 'canManageUserRoles',
  hasAccessToOrders: 'hasAccessToOrders',
  canManageOrders: 'canManageOrders',
  hasAccessToNews: 'hasAccessToNews',
  canManageNews: 'canManageNews',
  canCreateItems: 'canCreateItems',
  canManageItems: 'canManageItems',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(Permission);

const PERMISSION_SET = new Set<string>(ALL_PERMISSIONS);

export function isPermission(value: string): value is Permission {
  return PERMISSION_SET.has(value);
}

export function hasAbsoluteControl(
  userPermissions: readonly string[],
): boolean {
  return userPermissions.includes(Permission.hasAbsoluteControl);
}

export function hasPermission(
  userPermissions: readonly string[],
  required: Permission,
): boolean {
  if (hasAbsoluteControl(userPermissions)) {
    return true;
  }
  return userPermissions.includes(required);
}

export function hasAllPermissions(
  userPermissions: readonly string[],
  required: readonly Permission[],
): boolean {
  if (required.length === 0) {
    return true;
  }
  if (hasAbsoluteControl(userPermissions)) {
    return true;
  }
  return required.every((p) => userPermissions.includes(p));
}

export function assertPermissions(
  values: readonly string[],
): Permission[] {
  const invalid = values.filter((v) => !isPermission(v));
  if (invalid.length > 0) {
    throw new Error(`Unknown permissions: ${invalid.join(', ')}`);
  }
  return values as Permission[];
}

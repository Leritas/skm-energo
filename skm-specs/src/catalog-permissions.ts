import {
  assertPermissions,
  hasAnyPermission,
  hasPermission,
  Permission,
  type Permission as PermissionType,
} from './permissions';

export type CatalogEntityType = 'manufacturers' | 'categories' | 'products';

export const CATALOG_MANAGE_PERMISSIONS = [
  Permission.canManageManufacturers,
  Permission.canManageCategories,
  Permission.canManageProducts,
] as const satisfies readonly PermissionType[];

export const CATALOG_SECTION_PERMISSIONS = [
  Permission.hasAccessToCatalog,
  ...CATALOG_MANAGE_PERMISSIONS,
] as const satisfies readonly PermissionType[];

const CATALOG_ENTITY_MANAGE_PERMISSION: Record<
  CatalogEntityType,
  PermissionType
> = {
  manufacturers: Permission.canManageManufacturers,
  categories: Permission.canManageCategories,
  products: Permission.canManageProducts,
};

const LEGACY_CATALOG_PERMISSIONS = [
  'canCreateItems',
  'canManageItems',
] as const;

export function migrateLegacyCatalogPermissions(
  permissions: readonly string[],
): PermissionType[] {
  const migrated = new Set<string>(
    permissions.filter(
      (permission) =>
        !(LEGACY_CATALOG_PERMISSIONS as readonly string[]).includes(permission),
    ),
  );

  if (permissions.includes('canManageItems')) {
    for (const permission of CATALOG_SECTION_PERMISSIONS) {
      migrated.add(permission);
    }
  }

  if (permissions.includes('canCreateItems')) {
    migrated.add(Permission.hasAccessToCatalog);
    migrated.add(Permission.canManageProducts);
  }

  return assertPermissions([...migrated]);
}

export function canAccessCatalogSection(
  userPermissions: readonly string[],
): boolean {
  return hasAnyPermission(userPermissions, CATALOG_SECTION_PERMISSIONS);
}

export function canViewCatalogEntity(
  userPermissions: readonly string[],
  entity: CatalogEntityType,
): boolean {
  if (hasPermission(userPermissions, Permission.hasAccessToCatalog)) {
    return true;
  }
  return hasPermission(
    userPermissions,
    CATALOG_ENTITY_MANAGE_PERMISSION[entity],
  );
}

export function canManageCatalogEntity(
  userPermissions: readonly string[],
  entity: CatalogEntityType,
): boolean {
  return hasPermission(
    userPermissions,
    CATALOG_ENTITY_MANAGE_PERMISSION[entity],
  );
}

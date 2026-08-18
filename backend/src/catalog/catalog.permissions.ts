import { Permission, type Permission as PermissionType } from '@skm/specs';

export const CATALOG_ENTITY_MANAGE_PERMISSIONS = {
  manufacturers: Permission.canManageManufacturers,
  categories: Permission.canManageCategories,
  products: Permission.canManageProducts,
} as const satisfies Record<string, PermissionType>;

export const CATALOG_ENTITY_READ_PERMISSIONS = {
  manufacturers: [
    Permission.hasAccessToCatalog,
    Permission.canManageManufacturers,
  ],
  categories: [Permission.hasAccessToCatalog, Permission.canManageCategories],
  products: [Permission.hasAccessToCatalog, Permission.canManageProducts],
} as const satisfies Record<string, readonly PermissionType[]>;

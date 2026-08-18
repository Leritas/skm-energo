import {
  canManageCatalogEntity,
  canViewCatalogEntity,
  type CatalogEntityType,
} from '@skm/specs';

export type CatalogAdminTab = CatalogEntityType;

export interface CatalogAdminTabItem {
  label: string;
  value: CatalogAdminTab;
}

export const CATALOG_ADMIN_TABS: readonly CatalogAdminTabItem[] = [
  { label: 'Производители', value: 'manufacturers' },
  { label: 'Категории', value: 'categories' },
  { label: 'Товары', value: 'products' },
] as const;

export function getAccessibleCatalogTabs(
  userPermissions: readonly string[],
): CatalogAdminTabItem[] {
  return CATALOG_ADMIN_TABS.filter((tab) =>
    canViewCatalogEntity(userPermissions, tab.value),
  );
}

export function canManageCatalogTab(
  userPermissions: readonly string[],
  tab: CatalogAdminTab,
): boolean {
  return canManageCatalogEntity(userPermissions, tab);
}

export function getCatalogTabLabel(tab: CatalogAdminTab): string {
  const item = CATALOG_ADMIN_TABS.find((entry) => entry.value === tab);
  return item?.label ?? tab;
}

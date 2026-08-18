import {
  canAccessCatalogSection,
  canManageCatalogEntity,
  canViewCatalogEntity,
  migrateLegacyCatalogPermissions,
  Permission,
} from '@skm/specs';

describe('catalog permissions', () => {
  it('maps legacy manage permission to full catalog access', () => {
    expect(
      migrateLegacyCatalogPermissions(['canManageItems', Permission.hasAccessToAdmin]),
    ).toEqual(
      expect.arrayContaining([
        Permission.hasAccessToAdmin,
        Permission.hasAccessToCatalog,
        Permission.canManageManufacturers,
        Permission.canManageCategories,
        Permission.canManageProducts,
      ]),
    );
  });

  it('maps legacy create permission to catalog view and product manage', () => {
    expect(migrateLegacyCatalogPermissions(['canCreateItems'])).toEqual(
      expect.arrayContaining([
        Permission.hasAccessToCatalog,
        Permission.canManageProducts,
      ]),
    );
  });

  it('grants catalog section access from any catalog permission', () => {
    expect(canAccessCatalogSection([Permission.hasAccessToCatalog])).toBe(true);
    expect(canAccessCatalogSection([Permission.canManageProducts])).toBe(true);
    expect(canAccessCatalogSection([Permission.hasAccessToNews])).toBe(false);
  });

  it('separates catalog view and manage by entity', () => {
    const viewOnly = [Permission.hasAccessToCatalog];

    expect(canViewCatalogEntity(viewOnly, 'products')).toBe(true);
    expect(canManageCatalogEntity(viewOnly, 'products')).toBe(false);

    const productEditor = [Permission.canManageProducts];
    expect(canViewCatalogEntity(productEditor, 'products')).toBe(true);
    expect(canViewCatalogEntity(productEditor, 'manufacturers')).toBe(false);
    expect(canManageCatalogEntity(productEditor, 'products')).toBe(true);
  });
});

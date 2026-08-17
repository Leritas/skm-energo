import { hasAllPermissions, Permission } from '@skm/specs';
import { PermissionsService } from './permissions.service';

describe('permission helpers', () => {
  it('grants all when hasAbsoluteControl is present', () => {
    const perms = [Permission.hasAbsoluteControl];
    expect(
      hasAllPermissions(perms, [
        Permission.canDeleteUsers,
        Permission.canManageNews,
      ]),
    ).toBe(true);
  });

  it('requires AND for listed permissions', () => {
    const perms = [Permission.hasAccessToNews, Permission.hasAccessToOrders];
    expect(
      hasAllPermissions(perms, [
        Permission.hasAccessToNews,
        Permission.hasAccessToOrders,
      ]),
    ).toBe(true);
    expect(
      hasAllPermissions(perms, [
        Permission.hasAccessToNews,
        Permission.canDeleteUsers,
      ]),
    ).toBe(false);
  });
});

describe('PermissionsService', () => {
  it('unions permissions across roles', async () => {
    const prisma = {
      userRole: {
        findMany: jest.fn().mockResolvedValue([
          {
            role: {
              permissions: [
                Permission.hasAccessToNews,
                Permission.canManageNews,
              ],
            },
          },
          {
            role: {
              permissions: [Permission.hasAccessToOrders],
            },
          },
        ]),
      },
    };

    const service = new PermissionsService(prisma as never);
    const result = await service.getUserPermissions(1);
    expect(result.sort()).toEqual(
      [
        Permission.hasAccessToNews,
        Permission.canManageNews,
        Permission.hasAccessToOrders,
      ].sort(),
    );
  });
});

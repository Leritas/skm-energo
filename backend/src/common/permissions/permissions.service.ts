import { Injectable } from '@nestjs/common';
import {
  ALL_PERMISSIONS,
  assertPermissions,
  hasAllPermissions,
  type Permission,
} from '@skm/specs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const merged = new Set<string>();
    for (const link of userRoles) {
      for (const permission of link.role.permissions) {
        merged.add(permission);
      }
    }

    return assertPermissions([...merged]);
  }

  async userHasPermissions(
    userId: number,
    required: readonly Permission[],
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return hasAllPermissions(permissions, required);
  }

  validatePermissionList(values: string[]): Permission[] {
    return assertPermissions(values);
  }

  allCatalogPermissions(): readonly Permission[] {
    return ALL_PERMISSIONS;
  }
}

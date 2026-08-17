import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@skm/specs';

export const REQUIRE_PERMISSIONS_KEY = 'requirePermissions';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);

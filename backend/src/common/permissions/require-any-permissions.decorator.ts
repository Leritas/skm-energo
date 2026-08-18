import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@skm/specs';

export const REQUIRE_ANY_PERMISSIONS_KEY = 'requireAnyPermissions';

export const RequireAnyPermissions = (...permissions: Permission[]) =>
  SetMetadata(REQUIRE_ANY_PERMISSIONS_KEY, permissions);

import {
  hasAbsoluteControl as checkAbsolute,
  hasAllPermissions,
  hasAnyPermission as checkAnyPermission,
  hasPermission as checkPermission,
  type Permission,
} from '@skm/specs';

export function usePermissions() {
  const auth = useAuthStore();

  function hasPermission(required: Permission) {
    return checkPermission(auth.permissions, required);
  }

  function hasPermissions(...required: Permission[]) {
    return hasAllPermissions(auth.permissions, required);
  }

  function hasAnyPermission(...required: Permission[]) {
    return checkAnyPermission(auth.permissions, required);
  }

  function hasAbsoluteControl() {
    return checkAbsolute(auth.permissions);
  }

  return {
    hasPermission,
    hasPermissions,
    hasAnyPermission,
    hasAbsoluteControl,
  };
}

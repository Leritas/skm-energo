import type { CreateRoleRequest, RoleDto, UpdateRoleRequest } from '@skm/specs';

export function useRolesAdmin() {
  const { api } = useApi();

  function listRoles() {
    return api<RoleDto[]>('/roles', {
      method: 'GET',
    });
  }

  function createRole(body: CreateRoleRequest) {
    return api<RoleDto>('/roles', {
      method: 'POST',
      body,
    });
  }

  function updateRole(roleId: number, body: UpdateRoleRequest) {
    return api<RoleDto>(`/roles/${roleId}`, {
      method: 'PATCH',
      body,
    });
  }

  function deleteRole(roleId: number) {
    return api<{ deleted: true }>(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  return {
    listRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}

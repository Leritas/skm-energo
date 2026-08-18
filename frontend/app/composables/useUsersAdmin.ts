import type {
  AdminUserDto,
  CreateUserRequest,
  PaginatedResponse,
  SetUserRolesRequest,
} from '@skm/specs';

export function useUsersAdmin() {
  const { api } = useApi();

  function listUsers(page = 1, limit = 20) {
    return api<PaginatedResponse<AdminUserDto>>('/users', {
      query: { page, limit },
    });
  }

  function createUser(body: CreateUserRequest) {
    return api<AdminUserDto>('/users', {
      method: 'POST',
      body,
    });
  }

  function setUserRoles(userId: number, body: SetUserRolesRequest) {
    return api<AdminUserDto>(`/users/${userId}/roles`, {
      method: 'PUT',
      body,
    });
  }

  return {
    listUsers,
    createUser,
    setUserRoles,
  };
}

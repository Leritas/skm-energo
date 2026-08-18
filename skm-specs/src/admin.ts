import type { Permission } from './permissions';

export interface AdminUserRoleDto {
  id: number;
  slug: string;
  name: string;
}

export interface AdminUserDto {
  id: number;
  email: string;
  name: string;
  roles: AdminUserRoleDto[];
}

export interface RoleDto {
  id: number;
  slug: string;
  name: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  roleIds?: number[];
}

export interface SetUserRolesRequest {
  roleIds: number[];
}

export interface CreateRoleRequest {
  slug: string;
  name: string;
  permissions: Permission[];
}

export interface UpdateRoleRequest {
  name?: string;
  permissions?: Permission[];
}

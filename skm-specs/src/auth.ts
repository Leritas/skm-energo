import type { Permission } from './permissions';

export interface AuthRoleDto {
  id: number;
  slug: string;
  name: string;
}

export interface AuthUserDto {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  inn: string | null;
  position: string | null;
  roles: AuthRoleDto[];
  permissions: Permission[];
}

export interface UpdateProfileRequest {
  name: string;
  phone?: string | null;
  company?: string | null;
  inn?: string | null;
  position?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSessionResponse extends AuthTokens {
  user: AuthUserDto;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

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
  roles: AuthRoleDto[];
  permissions: Permission[];
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

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

export interface AdminManufacturerDto {
  id: number;
  slug: string;
  name: string;
  isPublished: boolean;
  deletedAt: string | null;
  productCount: number;
}

export interface CreateManufacturerRequest {
  slug: string;
  name: string;
  isPublished?: boolean;
}

export interface UpdateManufacturerRequest {
  slug?: string;
  name?: string;
  isPublished?: boolean;
}

export interface AdminCategoryDto {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  parentId: number | null;
  isPublished: boolean;
  deletedAt: string | null;
  productCount: number;
  childCount: number;
}

export interface CreateCategoryRequest {
  slug: string;
  name: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentId?: number | null;
  isPublished?: boolean;
}

export interface UpdateCategoryRequest {
  slug?: string;
  name?: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  parentId?: number | null;
  isPublished?: boolean;
}

export interface AdminProductSpecDto {
  label: string;
  value: string;
}

export interface AdminProductAssignmentOptionDto {
  id: number;
  slug: string;
  name: string;
}

export interface AdminProductAssignmentOptionsDto {
  manufacturers: AdminProductAssignmentOptionDto[];
  categories: AdminProductAssignmentOptionDto[];
}

export interface AdminProductDto {
  id: number;
  slug: string;
  title: string;
  sku: string;
  description: string;
  specs: AdminProductSpecDto[];
  pdfHref: string | null;
  badges: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  manufacturerId: number;
  manufacturerSlug: string;
  manufacturerName: string;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  isPublished: boolean;
  deletedAt: string | null;
}

export interface CreateProductRequest {
  title: string;
  sku: string;
  description: string;
  specs?: AdminProductSpecDto[];
  pdfHref?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  manufacturerId: number;
  categoryId: number;
  isPublished?: boolean;
}

export interface UpdateProductRequest {
  slug?: string;
  title?: string;
  sku?: string;
  description?: string;
  specs?: AdminProductSpecDto[];
  pdfHref?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  manufacturerId?: number;
  categoryId?: number;
  isPublished?: boolean;
}

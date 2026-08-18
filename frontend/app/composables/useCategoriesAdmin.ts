import type {
  AdminCategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@skm/specs';

export function useCategoriesAdmin() {
  const { api } = useApi();

  function listCategories(includeArchived = false) {
    return api<AdminCategoryDto[]>('/admin/catalog/categories', {
      query: { includeArchived },
    });
  }

  function createCategory(body: CreateCategoryRequest) {
    return api<AdminCategoryDto>('/admin/catalog/categories', {
      method: 'POST',
      body,
    });
  }

  function updateCategory(id: number, body: UpdateCategoryRequest) {
    return api<AdminCategoryDto>(`/admin/catalog/categories/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  function archiveCategory(id: number) {
    return api<AdminCategoryDto>(`/admin/catalog/categories/${id}`, {
      method: 'DELETE',
    });
  }

  function restoreCategory(id: number) {
    return api<AdminCategoryDto>(`/admin/catalog/categories/${id}/restore`, {
      method: 'POST',
    });
  }

  return {
    listCategories,
    createCategory,
    updateCategory,
    archiveCategory,
    restoreCategory,
  };
}

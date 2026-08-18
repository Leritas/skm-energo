import type {
  AdminProductAssignmentOptionsDto,
  AdminProductDto,
  CreateProductRequest,
  UpdateProductRequest,
} from '@skm/specs';

export function useProductsAdmin() {
  const { api } = useApi();

  function listProducts(includeArchived = false) {
    return api<AdminProductDto[]>('/admin/catalog/products', {
      query: { includeArchived },
    });
  }

  function listAssignmentOptions() {
    return api<AdminProductAssignmentOptionsDto>(
      '/admin/catalog/products/options',
    );
  }

  function getProduct(id: number) {
    return api<AdminProductDto>(`/admin/catalog/products/${id}`);
  }

  function createProduct(body: CreateProductRequest) {
    return api<AdminProductDto>('/admin/catalog/products', {
      method: 'POST',
      body,
    });
  }

  function updateProduct(id: number, body: UpdateProductRequest) {
    return api<AdminProductDto>(`/admin/catalog/products/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  function archiveProduct(id: number) {
    return api<AdminProductDto>(`/admin/catalog/products/${id}`, {
      method: 'DELETE',
    });
  }

  function restoreProduct(id: number) {
    return api<AdminProductDto>(`/admin/catalog/products/${id}/restore`, {
      method: 'POST',
    });
  }

  return {
    listProducts,
    listAssignmentOptions,
    getProduct,
    createProduct,
    updateProduct,
    archiveProduct,
    restoreProduct,
  };
}

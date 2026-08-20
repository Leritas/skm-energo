import type {
  AdminProductAssignmentOptionsDto,
  AdminProductDto,
  AttachedFile,
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

  function uploadProductPhoto(productId: number, file: File) {
    const body = new FormData();
    body.append('file', file);
    return api<{ item: AttachedFile }>(
      `/admin/catalog/products/${productId}/photos`,
      {
        method: 'POST',
        body,
      },
    );
  }

  function deleteProductPhoto(productId: number, photoId: number) {
    return api<void>(`/admin/catalog/products/${productId}/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  function reorderProductPhotos(productId: number, photoIds: number[]) {
    return api<{ items: AttachedFile[] }>(
      `/admin/catalog/products/${productId}/photos/order`,
      {
        method: 'PUT',
        body: { photoIds },
      },
    );
  }

  function uploadProductDocument(productId: number, file: File) {
    const body = new FormData();
    body.append('file', file);
    return api<{ item: AttachedFile }>(
      `/admin/catalog/products/${productId}/documents`,
      {
        method: 'POST',
        body,
      },
    );
  }

  function deleteProductDocument(productId: number, documentId: number) {
    return api<void>(
      `/admin/catalog/products/${productId}/documents/${documentId}`,
      {
        method: 'DELETE',
      },
    );
  }

  function reorderProductDocuments(productId: number, documentIds: number[]) {
    return api<{ items: AttachedFile[] }>(
      `/admin/catalog/products/${productId}/documents/order`,
      {
        method: 'PUT',
        body: { documentIds },
      },
    );
  }

  return {
    listProducts,
    listAssignmentOptions,
    getProduct,
    createProduct,
    updateProduct,
    archiveProduct,
    restoreProduct,
    uploadProductPhoto,
    deleteProductPhoto,
    reorderProductPhotos,
    uploadProductDocument,
    deleteProductDocument,
    reorderProductDocuments,
  };
}

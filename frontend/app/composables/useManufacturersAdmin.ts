import type {
  AdminManufacturerDto,
  CreateManufacturerRequest,
  UpdateManufacturerRequest,
} from '@skm/specs';

export function useManufacturersAdmin() {
  const { api } = useApi();

  function listManufacturers(includeArchived = false) {
    return api<AdminManufacturerDto[]>('/admin/catalog/manufacturers', {
      query: { includeArchived },
    });
  }

  function createManufacturer(body: CreateManufacturerRequest) {
    return api<AdminManufacturerDto>('/admin/catalog/manufacturers', {
      method: 'POST',
      body,
    });
  }

  function updateManufacturer(id: number, body: UpdateManufacturerRequest) {
    return api<AdminManufacturerDto>(`/admin/catalog/manufacturers/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  function archiveManufacturer(id: number) {
    return api<AdminManufacturerDto>(`/admin/catalog/manufacturers/${id}`, {
      method: 'DELETE',
    });
  }

  function restoreManufacturer(id: number) {
    return api<AdminManufacturerDto>(
      `/admin/catalog/manufacturers/${id}/restore`,
      {
        method: 'POST',
      },
    );
  }

  return {
    listManufacturers,
    createManufacturer,
    updateManufacturer,
    archiveManufacturer,
    restoreManufacturer,
  };
}

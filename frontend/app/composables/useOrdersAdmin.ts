import type {
  AdminOrderProductOptionDto,
  AdminOrderUserOptionDto,
  CreateAdminOrderRequest,
  ListOrdersAdminResponse,
  OrderDto,
  OrderStatus,
  UpdateAdminOrderRequest,
} from '@skm/specs';

export function useOrdersAdmin() {
  const { api } = useApi();

  function listOrders(options?: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }) {
    return api<ListOrdersAdminResponse>('/admin/orders', {
      query: {
        status: options?.status,
        page: options?.page ?? 1,
        limit: options?.limit ?? 200,
      },
    });
  }

  function listUserOptions(search?: string) {
    return api<AdminOrderUserOptionDto[]>('/admin/orders/user-options', {
      query: { search },
    });
  }

  function listProductOptions() {
    return api<AdminOrderProductOptionDto[]>('/admin/orders/product-options');
  }

  function getOrder(id: number) {
    return api<OrderDto>(`/admin/orders/${id}`);
  }

  function createOrder(body: CreateAdminOrderRequest) {
    return api<OrderDto>('/admin/orders', {
      method: 'POST',
      body,
    });
  }

  function updateOrder(id: number, body: UpdateAdminOrderRequest) {
    return api<OrderDto>(`/admin/orders/${id}`, {
      method: 'PATCH',
      body,
    });
  }

  return {
    listOrders,
    listUserOptions,
    listProductOptions,
    getOrder,
    createOrder,
    updateOrder,
  };
}

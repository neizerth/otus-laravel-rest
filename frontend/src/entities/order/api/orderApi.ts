import { api } from '@/shared/api';
import type { PaginatedResponse } from '@/shared/api';
import type { Order, CreateOrderBody } from '../model/types.js';

export function getOrders(): Promise<PaginatedResponse<Order>> {
  return api.get<PaginatedResponse<Order>>('/orders');
}

export function getOrder(id: number): Promise<Order> {
  return api.get<{ data: Order }>(`/orders/${id}`).then((r) => r.data);
}

export function createOrder(body: CreateOrderBody): Promise<Order> {
  return api
    .post<{ data: Order } | Order>('/orders', body)
    .then((r) => ('data' in r ? r.data : r));
}

export function completeOrder(id: number): Promise<Order> {
  return api
    .post<{ data: Order } | Order>(`/orders/${id}/complete`)
    .then((r) => ('data' in r ? r.data : r));
}

import { api } from '@/shared/api';
import type { PaginatedResponse } from '@/shared/api';
import type { Service, ServicesQuery, CreateServiceBody, UpdateServiceBody } from '../model/types.js';

export function getServices(query?: ServicesQuery): Promise<PaginatedResponse<Service>> {
  return api.get<PaginatedResponse<Service>>('/services', {
    params: query as Record<string, string | number | undefined>,
  });
}

export function getService(id: number): Promise<Service> {
  return api.get<{ data: Service }>(`/services/${id}`).then((r) => r.data);
}

export function createService(body: CreateServiceBody): Promise<Service> {
  return api
    .post<{ data: Service } | Service>('/services', body)
    .then((r) => ('data' in r ? r.data : r));
}

export function updateService(id: number, body: UpdateServiceBody): Promise<Service> {
  return api
    .put<{ data: Service } | Service>(`/services/${id}`, body)
    .then((r) => ('data' in r ? r.data : r));
}

export function deleteService(id: number): Promise<void> {
  return api.delete(`/services/${id}`);
}

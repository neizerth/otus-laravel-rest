import type { Service } from '@/entities/service';

export type OrderStatus = 'new' | 'accepted' | 'completed';

export interface Order {
  id: number;
  status: OrderStatus;
  event_date: string;
  service: Service;
  client?: { id: number; name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface CreateOrderBody {
  service_id: number;
  event_date: string;
}

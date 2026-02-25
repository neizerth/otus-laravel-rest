export interface Service {
  id: number;
  category: string;
  name: string;
  description: string | null;
  price: number;
  user_id: number;
  performer?: { id: number; name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface ServicesQuery {
  category?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
  /** Только услуги текущего пользователя (для ЛК исполнителя) */
  mine?: number;
  per_page?: number;
  page?: number;
}

export interface CreateServiceBody {
  category: string;
  name: string;
  description?: string | null;
  price: number;
}

export type UpdateServiceBody = Partial<CreateServiceBody>;

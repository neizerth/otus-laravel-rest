import { useEffect, useState } from 'react';
import { getServices } from '@/entities/service';
import type { Service } from '@/entities/service';
import { useAuth } from '@/features/auth';
import { CreateOrderForm } from '@/features/create-order';

interface ServiceListProps {
  /** Изменить значение после создания новой услуги, чтобы обновить список */
  refreshKey?: number;
  /** Вызывается после успешного создания заказа (чтобы обновить список заказов) */
  onOrderCreated?: () => void;
}

export function ServiceList({ refreshKey = 0, onOrderCreated }: ServiceListProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderingId, setOrderingId] = useState<number | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const fetchServices = () => {
    setLoading(true);
    getServices({ per_page: 20 })
      .then((res) => setServices(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, [refreshKey]);

  if (loading) return <p className="loading-hint">Загрузка услуг…</p>;
  if (error) return <p className="error">Ошибка: {error}</p>;
  if (services.length === 0) return <p className="empty-hint">Услуг пока нет.</p>;

  return (
    <>
      {orderSuccess && <p className="order-success">{orderSuccess}</p>}
      <ul className="service-list">
        {services.map((s) => (
          <li key={s.id}>
            <div className="service-list-title">{s.name}</div>
            <span className="meta">{s.category} · {s.price} ₽</span>
            {s.description && <p>{s.description}</p>}
            {user && (
              <div className="service-list-actions">
                {orderingId === s.id ? (
                  <CreateOrderForm
                    serviceId={s.id}
                    serviceName={s.name}
                    onSuccess={() => {
                      setOrderingId(null);
                      setOrderSuccess('Заказ оформлен.');
                      setTimeout(() => setOrderSuccess(null), 3000);
                      onOrderCreated?.();
                    }}
                    onCancel={() => setOrderingId(null)}
                  />
                ) : (
                  <button
                    type="button"
                    className="btn-order primary"
                    onClick={() => setOrderingId(s.id)}
                  >
                    Заказать
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

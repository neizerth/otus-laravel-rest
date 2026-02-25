import { useEffect, useState } from 'react';
import { getServices } from '@/entities/service';
import type { Service } from '@/entities/service';

interface MyServiceListProps {
  refreshKey?: number;
}

export function MyServiceList({ refreshKey = 0 }: MyServiceListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getServices({ mine: 1, per_page: 50 })
      .then((res) => setServices(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p className="loading-hint">Загрузка…</p>;
  if (error) return <p className="error">Ошибка: {error}</p>;
  if (services.length === 0) return <p className="empty-hint">У вас пока нет услуг. Добавьте первую выше.</p>;

  return (
    <ul className="service-list my-service-list">
      {services.map((s) => (
        <li key={s.id}>
          <div className="service-list-title">{s.name}</div>
          <span className="meta">{s.category} · {s.price} ₽</span>
          {s.description && <p>{s.description}</p>}
        </li>
      ))}
    </ul>
  );
}

import { useEffect, useState } from 'react';
import { getOrders, completeOrder } from '@/entities/order';
import type { Order } from '@/entities/order';
import { useAuth } from '@/features/auth';

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  accepted: 'Принят',
  completed: 'Выполнен',
};

interface OrderListProps {
  /** Изменить значение после создания/обновления заказа, чтобы обновить список */
  refreshKey?: number;
  /** Вызывается после отметки заказа выполненным */
  onOrderUpdated?: () => void;
}

export function OrderList({ refreshKey = 0, onOrderUpdated }: OrderListProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getOrders()
      .then((res) => setOrders(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [user, refreshKey]);

  if (!user) return null;
  if (loading) return <p className="loading-hint">Загрузка заказов…</p>;
  if (error) return <p className="error">Ошибка: {error}</p>;
  if (orders.length === 0) return <p className="empty-hint">Заказов пока нет.</p>;

  const handleComplete = async (orderId: number) => {
    setCompletingId(orderId);
    try {
      await completeOrder(orderId);
      onOrderUpdated?.();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' as const } : o))
      );
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <ul className="order-list">
      {orders.map((order) => {
        const isPerformer = user.id === order.service.user_id;
        const isClient = !isPerformer;
        const canComplete = isClient && order.status !== 'completed';
        return (
          <li key={order.id}>
            <div className="order-list-header">
              <strong>{order.service.name}</strong>
              <span className="order-badge">{isPerformer ? 'Исполнитель' : 'Заказчик'}</span>
            </div>
            <span className="meta">
              {order.service.category} · {order.event_date} · {STATUS_LABELS[order.status] ?? order.status}
            </span>
            {order.client && isPerformer && (
              <p className="order-client">
                Заказчик: {order.client.name} ({order.client.email})
              </p>
            )}
            {canComplete && (
              <div className="order-list-actions">
                <button
                  type="button"
                  className="primary"
                  disabled={completingId === order.id}
                  onClick={() => handleComplete(order.id)}
                >
                  {completingId === order.id ? 'Отправка…' : 'Отметить выполненным'}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

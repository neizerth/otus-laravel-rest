import { useState } from 'react';
import { createOrder } from '@/entities/order';

interface CreateOrderFormProps {
  serviceId: number;
  serviceName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateOrderForm({ serviceId, serviceName, onSuccess, onCancel }: CreateOrderFormProps) {
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createOrder({ service_id: serviceId, event_date: eventDate });
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="order-form">
      <p className="order-form-title">Заказать: {serviceName}</p>
      <label>
        Дата мероприятия
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          min={minDate}
          required
        />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="order-form-actions">
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Отправка…' : 'Оформить заказ'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

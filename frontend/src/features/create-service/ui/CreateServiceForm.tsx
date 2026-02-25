import { useState } from 'react';
import { createService } from '@/entities/service';
import type { CreateServiceBody } from '@/entities/service';

interface CreateServiceFormProps {
  onSuccess?: () => void;
}

export function CreateServiceForm({ onSuccess }: CreateServiceFormProps) {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: CreateServiceBody = {
        category: category.trim(),
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
      };
      await createService(body);
      setCategory('');
      setName('');
      setDescription('');
      setPrice('');
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="create-service-form">
      <h3>Добавить услугу</h3>
      {error && <p className="error">{error}</p>}
      <label>
        Категория
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Например: фотограф, dj"
          maxLength={100}
          required
        />
      </label>
      <label>
        Название
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название услуги"
          maxLength={255}
          required
        />
      </label>
      <label>
        Описание <span className="optional">(необязательно)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание услуги"
          rows={3}
          maxLength={2000}
        />
      </label>
      <label>
        Цена, ₽
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
          min={0}
          step={0.01}
          required
        />
      </label>
      <button type="submit" className="primary" disabled={loading}>
        {loading ? 'Создание…' : 'Создать услугу'}
      </button>
    </form>
  );
}

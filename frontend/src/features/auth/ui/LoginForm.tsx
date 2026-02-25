import { useState } from 'react';
import { useAuth } from '../model/AuthContext.js';
import type { LoginBody, RegisterBody } from '../model/types.js';

export function LoginForm() {
  const { register, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<'customer' | 'performer'>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email, password } as LoginBody);
      } else {
        if (password !== passwordConfirm) {
          setError('Пароли не совпадают');
          return;
        }
        await register({
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
          role,
        } as RegisterBody);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
      {error && <p className="error">{error}</p>}
      {mode === 'register' && (
        <>
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value as 'customer' | 'performer')}>
            <option value="customer">Заказчик</option>
            <option value="performer">Исполнитель</option>
          </select>
        </>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {mode === 'register' && (
        <input
          type="password"
          placeholder="Подтверждение пароля"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
      )}
      <div className="auth-actions">
        <button type="submit" className="primary" disabled={loading}>
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Вход'}
        </button>
      </div>
    </form>
  );
}

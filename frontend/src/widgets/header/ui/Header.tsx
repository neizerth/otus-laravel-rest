import { useAuth } from '@/features/auth';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="brand">
        <span className="brand-dot" aria-hidden />
        <h1>Event Services</h1>
      </div>
      <div className="header-right">
        {user ? (
          <div className="header-user">
            <span>
              <span className="name">{user.name}</span>
              <span className="role"> · {user.role === 'performer' ? 'Исполнитель' : 'Заказчик'}</span>
            </span>
            <button type="button" onClick={() => logout()}>
              Выйти
            </button>
          </div>
        ) : (
          <span className="header-hint">Войдите или зарегистрируйтесь ниже</span>
        )}
      </div>
    </header>
  );
}

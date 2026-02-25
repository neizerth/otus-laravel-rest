import { AuthProvider } from '@/features/auth';
import { HomePage } from '@/pages/home';
import './styles.css';

export function App() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}

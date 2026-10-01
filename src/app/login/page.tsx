import { safeLocalPath } from '../../lib/auth-flow';
import LoginForm from './form';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const { redirect, error } = await searchParams;
  const destination = safeLocalPath(redirect);
  return <main className="auth-shell">
    <h1>Войти в учётную запись</h1>
    <p>Мы отправим ссылку для входа на вашу почту.</p>
    {error && <p role="alert">{error}</p>}
    <LoginForm redirect={destination} />
  </main>;
}

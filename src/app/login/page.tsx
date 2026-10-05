import { safeLocalPath } from '../../lib/auth-flow';
import { getPreferences } from '../../lib/preferences';
import { messages } from '../../lib/i18n';
import { AuthFrame } from '../../components/auth-frame';
import LoginForm from './form';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const { redirect, error } = await searchParams;
  const { locale } = await getPreferences();
  const t = messages[locale];
  return <AuthFrame><span className="eyebrow">ACCESS / 01</span><h1>{t.loginTitle}</h1><p>{t.loginDescription}</p>{error && <p role="alert">{error}</p>}<LoginForm redirect={safeLocalPath(redirect)} /></AuthFrame>;
}

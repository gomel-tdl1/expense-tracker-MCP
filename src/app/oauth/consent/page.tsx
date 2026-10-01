import { redirect } from 'next/navigation';
import { loadConsentDetails } from '../../../lib/auth-flow';
import { createServerClient } from '../../../lib/supabase/server';
import { decideConsent } from './actions';

export default async function ConsentPage({ searchParams }: { searchParams: Promise<{ authorization_id?: string }> }) {
  const { authorization_id: id = '' } = await searchParams;
  if (!id) return <main className="auth-shell"><h1>Неверный запрос доступа</h1><p>Отсутствует идентификатор запроса.</p></main>;
  const supabase = await createServerClient();
  const { data: user } = await supabase.auth.getClaims();
  if (!user?.claims) redirect(`/login?redirect=${encodeURIComponent(`/oauth/consent?authorization_id=${encodeURIComponent(id)}`)}`);
  const details = await loadConsentDetails(supabase.auth, id);
  if (details.kind === 'redirect') redirect(details.url);
  if (details.kind === 'error') return <main className="auth-shell"><h1>Неверный запрос доступа</h1><p role="alert">{details.message}</p></main>;
  return <main className="auth-shell">
    <h1>Разрешить доступ к расходам?</h1>
    <p><strong>{details.clientName}</strong> запрашивает доступ к вашей учётной записи.</p>
    <p>Запрошенные права: {details.scopes.join(', ') || 'не указаны'}.</p>
    <form action={decideConsent}>
      <input type="hidden" name="authorization_id" value={id} />
      <button name="decision" value="approve" type="submit">Разрешить</button>
      <button name="decision" value="deny" type="submit">Отклонить</button>
    </form>
  </main>;
}

import { AuthFrame } from '../../../components/auth-frame';
import { getPreferences } from '../../../lib/preferences';
import { messages } from '../../../lib/i18n';
import { redirect } from 'next/navigation';
import { loadConsentDetails } from '../../../lib/auth-flow';
import { createServerClient } from '../../../lib/supabase/server';
import { decideConsent } from './actions';

export default async function ConsentPage({ searchParams }: { searchParams: Promise<{ authorization_id?: string }> }) {
  const { locale } = await getPreferences();
  const t = messages[locale];
  const { authorization_id: id = '' } = await searchParams;
  if (!id) return <AuthFrame><h1>{t.invalidRequest}</h1><p>{t.missingRequest}</p></AuthFrame>;
  const supabase = await createServerClient();
  const { data: user } = await supabase.auth.getClaims();
  if (!user?.claims) redirect(`/login?redirect=${encodeURIComponent(`/oauth/consent?authorization_id=${encodeURIComponent(id)}`)}`);
  const details = await loadConsentDetails(supabase.auth, id);
  if (details.kind === 'redirect') redirect(details.url);
  if (details.kind === 'error') return <AuthFrame><h1>{t.invalidRequest}</h1><p role="alert">{details.message}</p></AuthFrame>;
  return <AuthFrame>
    <h1>{t.consentTitle}</h1>
    <p><strong>{details.clientName}</strong> {t.requestsAccess}</p>
    <p>{t.scopes}: {details.scopes.join(', ') || t.unspecified}.</p>
    <form action={decideConsent}>
      <input type="hidden" name="authorization_id" value={id} />
      <button name="decision" value="approve" type="submit">{t.approve}</button>
      <button name="decision" value="deny" type="submit">{t.deny}</button>
    </form>
  </AuthFrame>;
}

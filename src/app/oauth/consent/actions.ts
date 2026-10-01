'use server';

import { redirect } from 'next/navigation';
import { consentDecision } from '../../../lib/auth-flow';
import { createServerClient } from '../../../lib/supabase/server';

export async function decideConsent(formData: FormData) {
  const id = String(formData.get('authorization_id') ?? '');
  const decision = formData.get('decision');
  if (decision !== 'approve' && decision !== 'deny') throw new Error('Invalid consent decision');
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect(`/login?redirect=${encodeURIComponent(`/oauth/consent?authorization_id=${encodeURIComponent(id)}`)}`);
  const url = await consentDecision(supabase.auth, id, decision);
  redirect(url);
}

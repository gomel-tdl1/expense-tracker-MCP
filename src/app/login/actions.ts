'use server';

import { messages, normalizeLocale } from '../../lib/i18n';
import { redirect } from 'next/navigation';
import { createServerClient } from '../../lib/supabase/server';
import { safeLocalPath } from '../../lib/auth-flow';

export async function signInWithPassword(formData: FormData) {
  const t = messages[normalizeLocale(String(formData.get('locale') ?? ''))];
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeLocalPath(String(formData.get('redirect') ?? ''));
  if (!email || !password) return { error: t.missingCredentials };
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: t.loginError };
  redirect(next);
}

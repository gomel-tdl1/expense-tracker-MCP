'use server';

import { createServerClient } from '../../lib/supabase/server';
import { safeLocalPath } from '../../lib/auth-flow';

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const next = safeLocalPath(String(formData.get('redirect') ?? ''));
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return { error: 'Не задан адрес сайта.' };
  const callback = new URL('/auth/callback', origin);
  callback.searchParams.set('next', next);
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callback.toString(), shouldCreateUser: true },
  });
  return error ? { error: error.message } : { success: true };
}

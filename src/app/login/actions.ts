'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '../../lib/supabase/server';
import { safeLocalPath } from '../../lib/auth-flow';

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeLocalPath(String(formData.get('redirect') ?? ''));
  if (!email || !password) return { error: 'Введите email и пароль.' };
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Неверный email или пароль.' };
  redirect(next);
}

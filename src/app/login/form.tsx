'use client';

import { useState, useTransition } from 'react';
import { useLocale } from '../../components/preferences';
import { messages } from '../../lib/i18n';
import { signInWithPassword } from './actions';

export default function LoginForm({ redirect }: { redirect: string }) {
  const locale = useLocale();
  const t = messages[locale];
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  return <form onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await signInWithPassword(form);
      if (result?.error) setMessage(result.error);
    });
  }}>
    <input type="hidden" name="locale" value={locale} />
    <input type="hidden" name="redirect" value={redirect} />
    <label htmlFor="email">Email</label>
    <input id="email" name="email" type="email" required autoComplete="email" />
    <label htmlFor="password">{t.password}</label>
    <input id="password" name="password" type="password" required autoComplete="current-password" />
    <button type="submit" disabled={pending}>{pending ? t.signingIn : t.signIn}</button>
    {message && <p role="alert">{message}</p>}
  </form>;
}

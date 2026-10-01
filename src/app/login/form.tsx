'use client';

import { useState, useTransition } from 'react';
import { signInWithPassword } from './actions';

export default function LoginForm({ redirect }: { redirect: string }) {
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
    <input type="hidden" name="redirect" value={redirect} />
    <label htmlFor="email">Email</label>
    <input id="email" name="email" type="email" required autoComplete="email" />
    <label htmlFor="password">Пароль</label>
    <input id="password" name="password" type="password" required autoComplete="current-password" />
    <button type="submit" disabled={pending}>{pending ? 'Входим…' : 'Войти'}</button>
    {message && <p role="alert">{message}</p>}
  </form>;
}

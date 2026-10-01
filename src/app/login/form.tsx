'use client';

import { useState, useTransition } from 'react';
import { sendMagicLink } from './actions';

export default function LoginForm({ redirect }: { redirect: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  return <form onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await sendMagicLink(form);
      setMessage(result.error ?? 'Ссылка отправлена. Проверьте почту.');
    });
  }}>
    <input type="hidden" name="redirect" value={redirect} />
    <label htmlFor="email">Email</label>
    <input id="email" name="email" type="email" required autoComplete="email" />
    <button type="submit" disabled={pending}>{pending ? 'Отправляем…' : 'Отправить ссылку'}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}

import { cookies } from 'next/headers';
import { normalizeLocale } from './i18n';

export async function getPreferences() {
  const store = await cookies();
  return {
    locale: normalizeLocale(store.get('expense-locale')?.value),
    theme: store.get('expense-theme')?.value === 'light' ? 'light' as const : 'dark' as const,
    motion: store.get('expense-motion')?.value !== 'off',
  };
}

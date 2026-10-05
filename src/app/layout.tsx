import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { getPreferences } from '../lib/preferences';
import { LocaleProvider } from '../components/preferences';

export const metadata: Metadata = { title: 'Расходы', description: 'Статистика покупок в PLN' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, theme, motion } = await getPreferences();
  return <html lang={locale} data-theme={theme} data-motion={motion ? 'on' : 'off'}><body><LocaleProvider locale={locale}>{children}</LocaleProvider></body></html>;
}

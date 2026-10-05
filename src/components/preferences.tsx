'use client';

import { createContext, useContext, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { locales, messages, type Locale } from '../lib/i18n';

const LocaleContext = createContext<Locale>('ru');
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}
export function useLocale() { return useContext(LocaleContext); }

function save(name: string, value: string) {
  document.cookie = `expense-${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}
export function Preferences({ initialTheme, initialMotion }: { initialTheme: 'light' | 'dark'; initialMotion: boolean }) {
  const locale = useLocale();
  const t = messages[locale];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [theme, setTheme] = useState(initialTheme);
  const [motion, setMotion] = useState(initialMotion);
  return <div className="preferences">
    <div className="language-switch" role="group" aria-label={t.language} aria-busy={pending}>
      {locales.map(value => <button key={value} type="button" lang={value} aria-label={{ ru: 'Русский', en: 'English', pl: 'Polski' }[value]} aria-pressed={locale === value} disabled={pending} onClick={() => {
        save('locale', value);
        startTransition(() => router.refresh());
      }}>{value.toUpperCase()}</button>)}
    </div>
    <button className="icon-button" type="button" aria-label={theme === 'dark' ? t.light : t.dark} title={theme === 'dark' ? t.light : t.dark} onClick={() => {
      const next = theme === 'dark' ? 'light' : 'dark';
      save('theme', next); document.documentElement.dataset.theme = next; setTheme(next);
    }}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span></button>
    <button className="icon-button motion-button" type="button" aria-label={motion ? t.motionOff : t.motionOn} title={motion ? t.motionOff : t.motionOn} aria-pressed={motion} onClick={() => {
      save('motion', motion ? 'off' : 'on'); document.documentElement.dataset.motion = motion ? 'off' : 'on'; setMotion(!motion);
    }}><span aria-hidden="true">{motion ? 'Ⅱ' : '▷'}</span></button>
  </div>;
}

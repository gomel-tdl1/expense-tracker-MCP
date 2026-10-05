import type { ReactNode } from 'react';
import { Brand, BeatStrip } from './brand';
import { Preferences } from './preferences';
import { getPreferences } from '../lib/preferences';
import { messages } from '../lib/i18n';

export async function AuthFrame({ children }: { children: ReactNode }) {
  const { locale, theme, motion } = await getPreferences();
  return <div className="auth-page"><header className="auth-header"><Brand locale={locale} /><Preferences initialTheme={theme} initialMotion={motion} /></header><div className="auth-layout"><div className="auth-art" aria-hidden="true"><span className="eyebrow">PERSONAL FINANCE / 174 BPM</span><strong>KEEP<br />YOUR<br /><em>RHYTHM.</em></strong><BeatStrip /><span className="binary">01001010 · 10010101 · 00110100</span></div><main className="auth-shell">{children}<p className="privacy-note">{messages[locale].privacy}</p></main></div></div>;
}

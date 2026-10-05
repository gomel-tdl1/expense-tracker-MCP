'use client';
import { useLocale } from '../../components/preferences';
import { messages } from '../../lib/i18n';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = messages[useLocale()];
  return <main className="dashboard-shell"><div className="page-content error-page"><span className="eyebrow">SIGNAL LOST</span><h1>{t.loadError}</h1><button onClick={reset}>{t.retry}</button></div></main>;
}

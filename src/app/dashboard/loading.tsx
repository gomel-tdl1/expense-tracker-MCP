'use client';
import { useLocale } from '../../components/preferences';
import { messages } from '../../lib/i18n';
import { BeatStrip } from '../../components/brand';

export default function Loading() {
  const t = messages[useLocale()];
  return <main className="dashboard-shell"><div className="page-content loading-page"><BeatStrip /><p role="status">{t.loading}</p></div></main>;
}

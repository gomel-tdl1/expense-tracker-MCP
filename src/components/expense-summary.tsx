import { formatMoney, messages, type Locale } from '../lib/i18n';
import type { MonthSummary } from '../lib/stats';

export function ExpenseSummary({ summary, locale }: { summary: MonthSummary; locale: Locale }) {
  const t = messages[locale];
  const difference = summary.currentGrosz - summary.priorGrosz;
  const largest = summary.recent.reduce<(typeof summary.recent)[number] | undefined>((best, item) => !best || item.total_grosz > best.total_grosz ? item : best, undefined);
  return <section className="summary-grid" aria-label={t.summary}>
    <div className="hero-card">
      <div className="hero-top"><span className="eyebrow">{t.monthTotal}</span><span className="card-index" aria-hidden="true">VOL. {summary.month.slice(-2)}</span></div>
      <strong className="hero-amount">{formatMoney(summary.currentGrosz, locale)}</strong>
      <span className="hero-foot">{difference === 0 ? t.unchanged : <><span className={`difference ${difference < 0 ? 'lower' : ''}`}>{difference > 0 ? '+' : '−'}{formatMoney(Math.abs(difference), locale)}</span> {t.compared}</>}</span>
      <div className="hero-decoration" aria-hidden="true">{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ height: `${20 + ((i * 37) % 80)}%` }} />)}</div>
    </div>
    <div className="comparison-card"><span className="eyebrow">{t.priorMonth}</span><strong>{formatMoney(summary.priorGrosz, locale)}</strong><span className="comparison-detail">{t.footer.split(' · ')[0]}</span></div>
    <div className="stat-card"><span className="stat-symbol" aria-hidden="true">≡</span><div><span>{t.transactions}</span><strong>{summary.recent.length}</strong></div><small aria-hidden="true">01</small></div>
    <div className="stat-card"><span className="stat-symbol violet" aria-hidden="true">≈</span><div><span>{t.average}</span><strong>{formatMoney(summary.recent.length ? Math.round(summary.currentGrosz / summary.recent.length) : 0, locale)}</strong></div><small aria-hidden="true">02</small></div>
    <div className="stat-card"><span className="stat-symbol cyan" aria-hidden="true">↗</span><div><span>{t.largest}</span><strong>{largest ? formatMoney(largest.total_grosz, locale) : '—'}</strong><span className="stat-merchant">{largest ? largest.merchant || t.purchase : t.noPurchases}</span></div><small aria-hidden="true">03</small></div>
  </section>;
}

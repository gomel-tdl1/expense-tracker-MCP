import { formatMoney, messages, type Locale } from '../lib/i18n';
import type { MonthSummary } from '../lib/stats';
import { Icon } from './icon';

export function MonthlyTotal({ summary, locale }: { summary: MonthSummary; locale: Locale }) {
  const t = messages[locale];
  const difference = summary.currentGrosz - summary.priorGrosz;
  return <div className="monthly-total"><div><strong className="hero-amount">{formatMoney(summary.currentGrosz,locale)}</strong><span>{t.monthTotal}</span></div>
    <div className="month-comparison"><strong className={difference<=0?'lower':'higher'}>{difference===0 ? '—' : `${difference>0?'+':'−'}${summary.priorGrosz>0 ? `${Math.abs(difference/summary.priorGrosz*100).toLocaleString(locale,{maximumFractionDigits:1})}%` : formatMoney(Math.abs(difference),locale)}`}</strong><span>{t.compared}</span></div>
  </div>;
}
export function ExpenseSummary({ summary, locale }: { summary: MonthSummary; locale: Locale }) {
 const t=messages[locale];
 const largest=summary.recent.reduce<(typeof summary.recent)[number]|undefined>((best,item)=>!best||item.total_grosz>best.total_grosz?item:best,undefined);
 return <section className="summary-grid" aria-label={t.summary}>
  <div className="stat-card"><span className="stat-symbol"><Icon name="purchases" /></span><div><span>{t.transactions}</span><strong>{summary.recent.length}</strong></div></div>
  <div className="stat-card"><span className="stat-symbol violet"><Icon name="average" /></span><div><span>{t.average}</span><strong>{formatMoney(summary.recent.length?Math.round(summary.currentGrosz/summary.recent.length):0,locale)}</strong></div></div>
  <div className="stat-card"><span className="stat-symbol cyan"><Icon name="largest" /></span><div><span>{t.largest}</span><strong>{largest?formatMoney(largest.total_grosz,locale):'—'}</strong><span className="stat-merchant">{largest?.merchant||t.noPurchases}</span></div></div>
 </section>;
}

import { formatDate, formatMoney, messages, type Locale } from '../lib/i18n';
import type { MonthSummary } from '../lib/stats';

export function DailyChart({ daily, locale, month }: { daily: MonthSummary['daily']; locale: Locale; month: string }) {
  const t = messages[locale];
  const max = Math.max(1, ...daily.map((day) => Math.abs(day.totalGrosz)));
  const daysInMonth = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();
  const totals = new Map(daily.map(day => [day.date, day.totalGrosz]));
  return <section className="panel chart-panel" aria-labelledby="daily-heading">
    <div className="panel-heading"><div><span className="eyebrow">{t.dynamics}</span><h2 id="daily-heading">{t.daily}</h2></div><span className="unit-label">PLN</span></div>
    {daily.length === 0 ? <div className="chart-empty"><span aria-hidden="true">― · ― · ―</span><p className="empty-small">{t.emptyChart}</p></div> : <>
      <div className="chart-scroll"><div className="daily-chart">{Array.from({ length: daysInMonth }, (_, index) => {
        const date = `${month}-${String(index + 1).padStart(2, '0')}`;
        const amount = totals.get(date) ?? 0;
        const label = `${formatDate(date, locale)}: ${formatMoney(amount, locale)}`;
        return <div className={`chart-day ${amount < 0 ? 'negative' : ''}`} key={date}>
          <div className="chart-track"><button type="button" className="chart-bar" aria-label={label} style={{ height: `${amount ? Math.max(3, Math.abs(amount) / max * 100) : 0}%` }} /><span className="chart-tooltip" aria-hidden="true">{label}</span></div>
          <time dateTime={date} aria-hidden="true">{index === 0 || (index + 1) % 5 === 0 || index + 1 === daysInMonth ? String(index + 1).padStart(2, '0') : '·'}</time>
        </div>;
      })}</div></div><p className="chart-hint">{t.chartHint}</p>
    </>}
  </section>;
}

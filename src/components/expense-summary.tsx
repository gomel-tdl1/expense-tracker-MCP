import { formatPln, type MonthSummary } from '../lib/stats';

export function ExpenseSummary({ summary }: { summary: MonthSummary }) {
  const difference = summary.currentGrosz - summary.priorGrosz;
  return <section className="summary-grid" aria-label="Итоги месяца">
    <div className="hero-card">
      <span className="eyebrow">За выбранный месяц</span>
      <strong className="hero-amount">{formatPln(summary.currentGrosz)}</strong>
      <span className="hero-foot">Документов с покупками: {summary.recent.length}</span>
    </div>
    <div className="comparison-card">
      <span className="eyebrow">Прошлый месяц</span>
      <strong>{formatPln(summary.priorGrosz)}</strong>
      <span className="comparison-detail">
        {difference === 0 ? 'Без изменений' : `${difference > 0 ? '+' : '−'}${formatPln(Math.abs(difference))} к прошлому месяцу`}
      </span>
    </div>
  </section>;
}

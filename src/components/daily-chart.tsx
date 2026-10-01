import { formatPln, type MonthSummary } from '../lib/stats';

export function DailyChart({ daily }: { daily: MonthSummary['daily'] }) {
  const max = Math.max(1, ...daily.map((day) => Math.abs(day.totalGrosz)));
  return <section className="panel chart-panel" aria-labelledby="daily-heading">
    <div className="panel-heading"><div><span className="eyebrow">Динамика</span><h2 id="daily-heading">По дням</h2></div></div>
    {daily.length === 0
      ? <p className="empty-small">В этом месяце пока нет записей.</p>
      : <div className="chart-scroll"><div className="daily-chart">
        {daily.map((day) => <div className="chart-day" key={day.date} title={`${day.date}: ${formatPln(day.totalGrosz)}`}>
          <span className="chart-value">{formatPln(day.totalGrosz)}</span>
          <div className="chart-track"><span className={`chart-bar ${day.totalGrosz < 0 ? 'negative' : ''}`} style={{ height: `${Math.max(4, Math.abs(day.totalGrosz) / max * 100)}%` }} /></div>
          <time dateTime={day.date}>{day.date.slice(-2)}</time>
        </div>)}
      </div></div>}
  </section>;
}

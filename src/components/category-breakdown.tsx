import { CATEGORY_LABELS, formatPln, type MonthSummary } from '../lib/stats';

export function CategoryBreakdown({ categories }: { categories: MonthSummary['categories'] }) {
  const entries = Object.entries(categories).filter(([, amount]) => amount !== 0).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, amount]) => Math.abs(amount)));
  return <section className="panel category-panel" aria-labelledby="category-heading">
    <div className="panel-heading"><div><span className="eyebrow">Структура</span><h2 id="category-heading">По категориям</h2></div></div>
    {entries.length === 0 ? <p className="empty-small">Категории появятся после первой записи.</p> :
      <ul className="category-list">{entries.map(([key, amount]) => <li key={key}>
        <div className="category-line"><span>{CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}</span><strong>{formatPln(amount)}</strong></div>
        <div className="category-track"><span style={{ width: `${Math.abs(amount) / max * 100}%` }} /></div>
      </li>)}</ul>}
  </section>;
}

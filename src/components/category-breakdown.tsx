import { categoryLabel, formatMoney, messages, type Locale } from '../lib/i18n';
import type { Category, MonthSummary } from '../lib/stats';

export function CategoryBreakdown({ categories, locale, selected, onSelect, available }: { categories: MonthSummary['categories']; locale: Locale; selected: Category | null; onSelect: (category: Category) => void; available: Category[] }) {
  const t = messages[locale];
  const entries = Object.entries(categories).filter(([key, amount]) => Number.isFinite(amount) && (amount !== 0 || available.includes(key as Category))).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, amount]) => Math.abs(amount)));
  return <section className="panel category-panel" id="categories" aria-labelledby="category-heading">
    <div className="panel-heading"><div><span className="eyebrow">{t.structure}</span><h2 id="category-heading">{t.byCategory}</h2></div><span className="panel-symbol" aria-hidden="true">▥</span></div>
    <p className="category-hint">{t.categoryHint}</p>
    {entries.length === 0 ? <p className="empty-small">{t.emptyCategories}</p> :
      <ul className="category-list">{entries.map(([key, amount], i) => <li key={key} className={`tone-${i % 4}`}>
        <button type="button" className="category-button" aria-pressed={selected === key} aria-expanded={selected === key} aria-controls={selected === key ? "category-results" : undefined} onClick={() => onSelect(key as Category)}><span className="category-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        <span className="category-data"><span className="category-line"><span>{categoryLabel(key, locale)}</span><strong>{formatMoney(amount, locale)}</strong></span>
        <span className="category-track"><span style={{ width: `${Math.abs(amount) / max * 100}%` }} /></span></span><span className="category-arrow" aria-hidden="true">↗</span></button>
      </li>)}</ul>}
  </section>;
}

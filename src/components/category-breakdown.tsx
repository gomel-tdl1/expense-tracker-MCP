import Link from 'next/link';
import { categoryLabel, formatMoney, messages, type Locale } from '../lib/i18n';
import type { Category, MonthSummary } from '../lib/stats';
import { Icon } from './icon';

export function CategoryBreakdown({ categories, locale, month, limit, available = [] }: {
  categories: MonthSummary['categories']; locale: Locale; month: string; limit?: number; available?: Category[];
}) {
  const t = messages[locale];
  const all = Object.entries(categories).filter(([key, amount]) => Number.isFinite(amount) && (amount !== 0 || available.includes(key as Category))).sort((a,b) => b[1]-a[1]);
  const entries = limit ? all.slice(0,limit) : all;
  const magnitude = all.reduce((sum,[,amount])=>sum+Math.abs(amount),0);
  return <section className="panel category-panel" aria-labelledby="category-heading">
    <div className="panel-heading"><h2 id="category-heading">{t.byCategory}</h2><Icon name="categories" /></div>
    {entries.length === 0 ? <p className="empty-small">{t.emptyCategories}</p> : <ul className="category-list">{entries.map(([key,amount],i)=><li key={key} className={`tone-${i%4}`}>
      <Link className="category-button" href={`/dashboard/categories/${key}?month=${month}`}>
        <span className="category-number"><Icon name={key} /></span>
        <span className="category-data"><span className="category-line"><span>{categoryLabel(key,locale)}</span><strong>{formatMoney(amount,locale)}</strong></span>
          <span className="category-meter"><span className="category-track"><span style={{width:`${magnitude ? Math.abs(amount)/magnitude*100 : 0}%`}} /></span><small>{magnitude ? Math.round(Math.abs(amount)/magnitude*100) : 0}%</small></span>
        </span>
      </Link>
    </li>)}</ul>}
    {limit && <Link className="text-link category-more" href={`/dashboard/categories?month=${month}`}>{t.allCategories}<Icon name="arrow" /></Link>}
  </section>;
}

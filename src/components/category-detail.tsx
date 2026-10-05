import Link from 'next/link';
import { itemsInCategory } from '../lib/category-items';
import { categoryLabel, formatDate, formatMoney, intlLocale, messages, type Locale } from '../lib/i18n';
import type { Category, MonthSummary } from '../lib/stats';
import { Icon } from './icon';
export function CategoryDetail({ summary, category, locale }: { summary: MonthSummary; category: Category; locale: Locale }) {
  const t=messages[locale];
  const result=itemsInCategory(summary.recent,category);
  return <>
    <Link className="text-link back-link" href={`/dashboard/categories?month=${summary.month}`}>← {t.backCategories}</Link>
    <section className="panel category-detail" aria-labelledby="detail-heading">
      <div className="category-detail-summary"><span className="category-number"><Icon name={category}/></span><div><h2 id="detail-heading">{categoryLabel(category,locale)}</h2><p>{result.items.length} {t.items}</p></div><strong>{formatMoney(result.totalGrosz,locale)}</strong></div>
      {result.items.length===0?<div className="empty-receipts"><p>{t.emptyChart}</p></div>:<ul className="category-results">{result.items.map(item=><li key={`${item.receiptId}-${item.id}`}><div><strong>{item.name}</strong><small>{item.merchant||t.purchase} · <time dateTime={item.spentOn}>{formatDate(item.spentOn,locale)}</time> · {new Intl.NumberFormat(intlLocale[locale]).format(item.quantity)} ×</small></div><strong className="item-amount">{formatMoney(item.amount_grosz,locale)}</strong></li>)}</ul>}
    </section>
  </>;
}

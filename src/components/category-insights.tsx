'use client';

import { useRef, useState, type ReactNode } from 'react';
import { CategoryBreakdown } from './category-breakdown';
import { itemsInCategory } from '../lib/category-items';
import { categoryLabel, formatDate, formatMoney, intlLocale, messages, type Locale } from '../lib/i18n';
import type { Category, MonthSummary, ReceiptWithItems } from '../lib/stats';

export function CategoryInsights({ categories, receipts, locale, children }: {
  categories: MonthSummary['categories']; receipts: ReceiptWithItems[]; locale: Locale; children: ReactNode;
}) {
  const [selected, setSelected] = useState<Category | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const t = messages[locale];
  const result = selected ? itemsInCategory(receipts, selected) : null;
  const available = Array.from(new Set(receipts.flatMap(receipt => receipt.expense_items.map(item => item.category))));
  return <div ref={root}>
    <div className="insights-grid">{children}<CategoryBreakdown categories={categories} locale={locale} selected={selected} onSelect={category => setSelected(category === selected ? null : category)} available={available} /></div>
    <p className="sr-only" role="status">{selected && result ? `${categoryLabel(selected, locale)}: ${result.items.length} ${t.items}, ${formatMoney(result.totalGrosz, locale)}` : ''}</p>
    {selected && result && <section className="panel category-details" id="category-results" aria-labelledby="category-results-heading">
      <div className="panel-heading"><div><span className="eyebrow">{t.categoryPurchases}</span><h2 id="category-results-heading">{categoryLabel(selected, locale)}</h2></div><button className="clear-category" onClick={() => {
        root.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
        setSelected(null);
      }}>{t.closeCategory} ×</button></div>
      <p className="filter-total"><span>{result.items.length} {t.items}</span><span>{t.categoryTotal}: <strong>{formatMoney(result.totalGrosz, locale)}</strong></span></p>
      <ul className="category-results">{result.items.map(item => <li key={`${item.receiptId}-${item.id}`}><div><strong>{item.name}</strong><small>{item.merchant || t.purchase} · <time dateTime={item.spentOn}>{formatDate(item.spentOn, locale)}</time> · {new Intl.NumberFormat(intlLocale[locale]).format(item.quantity)} ×</small></div><strong className="item-amount">{formatMoney(item.amount_grosz, locale)}</strong></li>)}</ul>
    </section>}
  </div>;
}

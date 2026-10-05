import { categoryLabel, formatDate, formatMoney, messages, intlLocale, type Locale } from '../lib/i18n';
import { merchantIdentity } from '../lib/merchant';
import type { ReceiptWithItems } from '../lib/stats';

export function ReceiptList({ receipts, locale }: { receipts: ReceiptWithItems[]; locale: Locale }) {
  const t = messages[locale];
  return <section className="panel receipts-panel" id="purchases" aria-labelledby="receipt-heading">
    <div className="panel-heading"><div><span className="eyebrow">{t.history}</span><h2 id="receipt-heading">{t.recent}</h2></div><span className="count-pill">{receipts.length}</span></div>
    {receipts.length === 0 ? <div className="empty-receipts"><div className="empty-icon" aria-hidden="true">↗</div><h3>{t.emptyTitle}</h3><p>{t.emptyBody}</p></div> : <div className="receipt-list">
      {receipts.map(receipt => {
        const identity = merchantIdentity(receipt.merchant);
        return <details className="receipt" key={receipt.id}><summary>
          <span className={`receipt-icon tone-${identity.tone}`} aria-hidden="true">{identity.initials}</span>
          <span className="receipt-title"><strong>{receipt.merchant || t.purchase}</strong><small><time dateTime={receipt.spent_on}>{formatDate(receipt.spent_on, locale)}</time> · {receipt.expense_items.length} {t.items}</small></span>
          <strong className="receipt-total">{formatMoney(receipt.total_grosz, locale)}</strong><span className="chevron" aria-hidden="true">↗</span>
        </summary><div className="receipt-items"><ul>{[...receipt.expense_items].sort((a, b) => a.position - b.position).map(item => <li key={item.id}>
          <span><strong>{item.name}</strong><small>{new Intl.NumberFormat(intlLocale[locale]).format(item.quantity)} × · {categoryLabel(item.category, locale)}</small></span><span>{formatMoney(item.amount_grosz, locale)}</span>
        </li>)}</ul></div></details>;
      })}
    </div>}
  </section>;
}

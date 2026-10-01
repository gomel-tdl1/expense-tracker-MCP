import { CATEGORY_LABELS, formatPln, type ReceiptWithItems } from '../lib/stats';

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
}

export function ReceiptList({ receipts }: { receipts: ReceiptWithItems[] }) {
  return <section className="panel receipts-panel" aria-labelledby="receipt-heading">
    <div className="panel-heading"><div><span className="eyebrow">История</span><h2 id="receipt-heading">Последние покупки</h2></div><span className="count-pill">{receipts.length}</span></div>
    {receipts.length === 0 ? <div className="empty-receipts">
      <div className="empty-icon" aria-hidden="true">↗</div>
      <h3>Здесь появятся ваши покупки</h3>
      <p>Отправьте фото чека или список покупок в чат с подключённым MCP. Позиции появятся здесь автоматически.</p>
    </div> : <div className="receipt-list">
      {receipts.map((receipt) => <details className="receipt" key={receipt.id}>
        <summary>
          <span className="receipt-icon" aria-hidden="true">{receipt.merchant?.slice(0, 1).toUpperCase() || '•'}</span>
          <span className="receipt-title"><strong>{receipt.merchant || 'Покупка'}</strong><small><time dateTime={receipt.spent_on}>{dateLabel(receipt.spent_on)}</time> · {receipt.expense_items.length} поз.</small></span>
          <strong className="receipt-total">{formatPln(receipt.total_grosz)}</strong>
          <span className="chevron" aria-hidden="true">⌄</span>
        </summary>
        <div className="receipt-items"><ul>
          {[...receipt.expense_items].sort((a, b) => a.position - b.position).map((item) => <li key={item.id}>
            <span><strong>{item.name}</strong><small>{item.quantity} × · {CATEGORY_LABELS[item.category]}</small></span>
            <span>{formatPln(item.amount_grosz)}</span>
          </li>)}
        </ul></div>
      </details>)}
    </div>}
  </section>;
}

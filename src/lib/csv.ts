import { categoryLabel, type Locale } from './i18n';
import type { Category, ReceiptWithItems } from './stats';

function textCell(value: string) {
  // User-supplied text must not become an Excel/Sheets formula.
  const safe = /^[\s\uFEFF]*[=+@-]/u.test(value) || /^[\t\r\n]/u.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function expensesCsv(receipts: ReceiptWithItems[], locale: Locale, category?: Category) {
  const rows = ['Date,Merchant,Item,Category,Quantity,Amount (PLN),Currency'];
  for (const receipt of receipts) {
    for (const item of [...receipt.expense_items].sort((a,b) => a.position-b.position)) {
      if (category && item.category !== category) continue;
      rows.push([textCell(receipt.spent_on),textCell(receipt.merchant ?? ''),textCell(item.name),textCell(categoryLabel(item.category,locale)),String(item.quantity),(item.amount_grosz/100).toFixed(2),'PLN'].join(','));
    }
  }
  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}

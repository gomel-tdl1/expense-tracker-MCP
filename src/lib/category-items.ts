import type { Category, ExpenseItem, ReceiptWithItems } from './stats';

export function itemsInCategory(receipts: ReceiptWithItems[], category: Category) {
  const items: (ExpenseItem & { receiptId: string; merchant: string | null; spentOn: string })[] = [];
  for (const receipt of receipts) {
    for (const item of [...receipt.expense_items].sort((a, b) => a.position - b.position)) {
      if (item.category === category) items.push({ ...item, receiptId: receipt.id, merchant: receipt.merchant, spentOn: receipt.spent_on });
    }
  }
  return { items, totalGrosz: items.reduce((sum, item) => sum + item.amount_grosz, 0) };
}

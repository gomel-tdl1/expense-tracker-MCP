import { CATEGORY_LABELS, type Category } from '../../supabase/functions/_shared/categories';

export { CATEGORY_LABELS };
export type { Category };
export type ExpenseItem = {
  id: string; name: string; quantity: number; amount_grosz: number; category: Category; position: number;
};
export type ReceiptWithItems = {
  id: string; spent_on: string; merchant: string | null; currency: 'PLN';
  total_grosz: number; created_at: string; expense_items: ExpenseItem[];
};
export type MonthSummary = {
  month: string; currentGrosz: number; priorGrosz: number;
  daily: { date: string; totalGrosz: number }[];
  categories: Record<Category, number>;
  recent: ReceiptWithItems[];
};

export function monthBounds(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Неверный месяц');
  const [year, number] = month.split('-').map(Number);
  const date = (offset: number) => {
    const value = new Date(Date.UTC(year, number - 1 + offset, 1));
    return value.toISOString().slice(0, 10);
  };
  return { priorStart: date(-1), currentStart: date(0), nextStart: date(1) };
}

export function summarizeMonth(receipts: ReceiptWithItems[], month: string, _todayWarsaw: string): MonthSummary {
  const { priorStart, currentStart, nextStart } = monthBounds(month);
  const current = receipts.filter((receipt) => receipt.spent_on >= currentStart && receipt.spent_on < nextStart);
  const prior = receipts.filter((receipt) => receipt.spent_on >= priorStart && receipt.spent_on < currentStart);
  const categories = Object.fromEntries(Object.keys(CATEGORY_LABELS).map((key) => [key, 0])) as Record<Category, number>;
  const daily = new Map<string, number>();
  for (const receipt of current) {
    daily.set(receipt.spent_on, (daily.get(receipt.spent_on) ?? 0) + receipt.total_grosz);
    for (const item of receipt.expense_items) categories[item.category] += item.amount_grosz;
  }
  return {
    month,
    currentGrosz: current.reduce((sum, receipt) => sum + receipt.total_grosz, 0),
    priorGrosz: prior.reduce((sum, receipt) => sum + receipt.total_grosz, 0),
    daily: [...daily].sort(([a], [b]) => a.localeCompare(b)).map(([date, totalGrosz]) => ({ date, totalGrosz })),
    categories,
    recent: current.sort((a, b) => b.spent_on.localeCompare(a.spent_on) || b.created_at.localeCompare(a.created_at)),
  };
}

export function formatPln(grosz: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(grosz / 100);
}

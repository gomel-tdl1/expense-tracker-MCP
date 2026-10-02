import { describe, expect, it } from 'vitest';
import { monthBounds, summarizeMonth, type ReceiptWithItems } from '../src/lib/stats';

const receipt = (spent_on: string, total_grosz: number, items: ReceiptWithItems['expense_items']): ReceiptWithItems => ({
  id: `${spent_on}-${total_grosz}`,
  spent_on,
  merchant: 'Sklep',
  currency: 'PLN',
  total_grosz,
  created_at: `${spent_on}T12:00:00Z`,
  expense_items: items,
});

describe('monthly statistics', () => {
  it('separates receipts at the Warsaw calendar month boundary', () => {
    const receipts = [receipt('2026-09-30', 500, []), receipt('2026-10-01', 900, [])];
    const summary = summarizeMonth(receipts, '2026-10', '2026-10-01');
    expect(summary.currentGrosz).toBe(900);
    expect(summary.priorGrosz).toBe(500);
    expect(summary.daily).toEqual([{ date: '2026-10-01', totalGrosz: 900 }]);
  });

  it('subtracts discounts from the total and category', () => {
    const summary = summarizeMonth([receipt('2026-10-03', 1000, [
      { id: '1', name: 'Еда', quantity: 1, amount_grosz: 1200, category: 'groceries', position: 1 },
      { id: '2', name: 'Скидка', quantity: 1, amount_grosz: -200, category: 'groceries', position: 2 },
    ])], '2026-10', '2026-10-03');
    expect(summary.currentGrosz).toBe(1000);
    expect(summary.categories.groceries).toBe(1000);
  });

  it('shows beer spending under alcohol', () => {
    const summary = summarizeMonth([receipt('2026-10-02', 1200, [
      { id: 'beer', name: 'Piwo', quantity: 2, amount_grosz: 1200, category: 'alcohol', position: 1 },
    ])], '2026-10', '2026-10-02');
    expect(summary.categories.alcohol).toBe(1200);
    expect(summary.categories.groceries).toBe(0);
  });

  it('returns a real empty state with no daily bars', () => {
    const summary = summarizeMonth([], '2026-10', '2026-10-01');
    expect(summary.currentGrosz).toBe(0);
    expect(summary.daily).toEqual([]);
    expect(summary.recent).toEqual([]);
  });

  it('uses the entire previous calendar month', () => {
    const receipts = [receipt('2026-09-01', 100, []), receipt('2026-09-30', 300, []), receipt('2026-08-31', 500, [])];
    expect(monthBounds('2026-10')).toEqual({ priorStart: '2026-09-01', currentStart: '2026-10-01', nextStart: '2026-11-01' });
    expect(summarizeMonth(receipts, '2026-10', '2026-10-01').priorGrosz).toBe(400);
  });
});

import { describe, expect, it } from 'vitest';
import { CATEGORY_KEYS } from '../supabase/functions/_shared/categories';
import { categoryLabel, formatMoney, normalizeLocale, categoryTranslations } from '../src/lib/i18n';
import { merchantIdentity } from '../src/lib/merchant';

describe('localized presentation', () => {
  it('falls back safely for an unsupported language cookie', () => {
    expect(normalizeLocale('de')).toBe('ru');
    expect(normalizeLocale(undefined)).toBe('ru');
    expect(normalizeLocale('pl')).toBe('pl');
  });
  it('has translations for every database category in every language', () => {
    for (const locale of ['ru', 'en', 'pl'] as const) {
      expect(Object.keys(categoryTranslations[locale]).sort()).toEqual([...CATEGORY_KEYS].sort());
      for (const category of CATEGORY_KEYS) expect(categoryLabel(category, locale).length).toBeGreaterThan(0);
    }
    expect(categoryLabel('fuel', 'pl')).toBe('Paliwo');
    expect(categoryLabel('alcohol', 'en')).toBe('Alcohol');
    expect(categoryLabel('future-category', 'en')).toBe('Other');
  });
  it('formats signed grosz as PLN in each language without changing the value', () => {
    expect(formatMoney(123456, 'en')).toContain('1,234.56');
    expect(formatMoney(-1234, 'pl')).toContain('-12,34');
    expect(formatMoney(0, 'ru')).toContain('0,00');
  });
});

describe('merchant monograms', () => {
  it('recognizes a chain with a branch suffix without matching unrelated merchants', () => {
    expect(merchantIdentity('  Żabka 123 Warszawa ').initials).toBe('Ż');
    expect(merchantIdentity('LIDL #102').initials).toBe('L');
    expect(merchantIdentity('BP Warszawa').initials).toBe('BP');
    expect(merchantIdentity('ABP Market').initials).toBe('AM');
  });
  it('handles unknown and missing merchants with a stable, nonempty identity', () => {
    expect(merchantIdentity('Local Coffee')).toEqual(merchantIdentity('Local Coffee'));
    expect(merchantIdentity('Local Coffee').initials).toBe('LC');
    expect(merchantIdentity(null).initials).toBe('↗');
    expect(merchantIdentity('   ').initials).toBe('↗');
  });
});

import { itemsInCategory } from '../src/lib/category-items';
import type { ReceiptWithItems } from '../src/lib/stats';
describe('category purchases', () => {
  it('returns only matching line items, with receipt context and signed totals', () => {
    const receipts: ReceiptWithItems[] = [{ id: 'receipt-1', merchant: 'ORLEN', spent_on: '2026-10-05', created_at: '2026-10-05T10:00:00Z', currency: 'PLN', total_grosz: 20500, expense_items: [
      { id: 'fuel-1', name: 'ON', quantity: 30, category: 'fuel', amount_grosz: 20000, position: 0 },
      { id: 'coffee', name: 'Coffee', quantity: 1, category: 'cafes', amount_grosz: 1000, position: 1 },
      { id: 'discount', name: 'Fuel discount', quantity: 1, category: 'fuel', amount_grosz: -500, position: 2 },
    ] }];
    const result = itemsInCategory(receipts, 'fuel');
    expect(result.items.map(item => item.id)).toEqual(['fuel-1', 'discount']);
    expect(result.totalGrosz).toBe(19500);
    expect(result.items[0]).toMatchObject({ merchant: 'ORLEN', spentOn: '2026-10-05', quantity: 30 });
    expect(itemsInCategory(receipts, 'alcohol')).toEqual({ items: [], totalGrosz: 0 });
    expect(receipts[0].expense_items).toHaveLength(3);
  });
});

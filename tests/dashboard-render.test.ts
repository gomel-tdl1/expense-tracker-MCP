import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh() {} }) }));
import { DashboardView } from '../src/components/dashboard-view';
import { LocaleProvider } from '../src/components/preferences';
import { summarizeMonth, type ReceiptWithItems } from '../src/lib/stats';

const receipts: ReceiptWithItems[] = [{
  id: '1', spent_on: '2026-10-05', created_at: '2026-10-05T12:00:00Z', merchant: 'ORLEN', currency: 'PLN', total_grosz: 20000,
  expense_items: [{ id: 'item', name: 'ON Diesel', quantity: 30, amount_grosz: 20000, category: 'fuel', position: 0 }],
}];
describe('dashboard server rendering', () => {
  it('renders Polish categories, dates and amounts from real receipt fields', () => {
    const html = renderToStaticMarkup(createElement(LocaleProvider, { locale: 'pl', children: createElement(DashboardView, {
      summary: summarizeMonth(receipts, '2026-10', '2026-10-05'), locale: 'pl', theme: 'dark', motion: true, signOut: null,
    }) }));
    expect(html).toContain('Paliwo');
    expect(html).toContain('październik');
    expect(html).toContain('ON Diesel');
    expect(html).toContain('aria-label="Język"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('<img');
  });
  it('renders an honest empty state in English without fake purchases or chart bars', () => {
    const html = renderToStaticMarkup(createElement(LocaleProvider, { locale: 'en', children: createElement(DashboardView, {
      summary: summarizeMonth([], '2026-10', '2026-10-05'), locale: 'en', theme: 'light', motion: false, signOut: null,
    }) }));
    expect(html).toContain('First receipt. First beat.');
    expect(html).toContain('No purchases this month yet.');
    expect(html).not.toContain('class="chart-bar"');
    expect(html).not.toContain('NaN');
  });
});

import { describe, expect, it } from 'vitest';
import { expensesCsv } from '../src/lib/csv';
import { summarizeMonth, type ReceiptWithItems } from '../src/lib/stats';
const receipts: ReceiptWithItems[] = [{ id:'r', spent_on:'2026-10-05', created_at:'2026-10-05T12:00:00Z', merchant:'=HYPERLINK("evil")', currency:'PLN',total_grosz:19900,expense_items:[
 { id:'a',name:'Diesel, "premium"',quantity:30.5,category:'fuel',amount_grosz:20000,position:0 },
 { id:'b',name:'Discount\nVoucher',quantity:1,category:'fuel',amount_grosz:-100,position:1 },
 { id:'c',name:'Coffee',quantity:1,category:'cafes',amount_grosz:1000,position:2 },
]}];
describe('CSV export', () => {
 it('exports filtered line totals, quantity and escaped text without executable spreadsheet formulas', () => {
  const csv = expensesCsv(receipts, 'en', 'fuel');
  expect(csv.startsWith('\uFEFF')).toBe(true);
  expect(csv).toContain('"\'=HYPERLINK(""evil"")"');
  expect(csv).toContain('"Diesel, ""premium"""');
  expect(csv).toContain('30.5,200.00,PLN');
  expect(csv).toContain('1,-1.00,PLN');
  expect(csv).not.toContain('Coffee');
 });
 it('exports only the chosen month when given the monthly summary', () => {
  const summary = summarizeMonth([...receipts, {...receipts[0],id:'prior',spent_on:'2026-09-05'}], '2026-10','2026-10-05');
  const csv = expensesCsv(summary.recent, 'pl');
  expect(csv).not.toContain('2026-09-05');
  expect(csv).toContain('Paliwo');
  expect(csv).toContain('Coffee');
 });
 it('exports a header for an empty month', () => expect(expensesCsv([], 'ru').split('\r\n')).toHaveLength(2));
});

import { describe, expect, it } from 'vitest'
import {
  fingerprintReceipt,
  normalizeReceipt,
  parsePlnAmount,
  warsawDate
} from '../supabase/functions/_shared/expense'

describe('PLN input', () => {
  it('converts comma decimals to integer groszy', () => {
    expect(parsePlnAmount('12,5')).toBe(1250)
    expect(parsePlnAmount('-2,00')).toBe(-200)
  })

  it('rejects more than two decimal places', () => {
    expect(() => parsePlnAmount('1,234')).toThrow(/decimal/)
  })
})

describe('receipt normalization', () => {
  const base = {
    merchant: ' Market ',
    items: [
      { name: ' Bread ', quantity: 1, amount_pln: '8,00', category: 'groceries' },
      { name: 'Milk', quantity: 2, amount_pln: '12,00', category: 'groceries' }
    ]
  }

  it('requires a readable price for every item', () => {
    expect(() => normalizeReceipt({ ...base, items: [{ name: 'Bread', quantity: 1, category: 'groceries' }] }, '2026-10-01')).toThrow(/price/)
  })

  it('rejects a printed total that differs from the line sum', () => {
    expect(() => normalizeReceipt({ ...base, total_pln: '19,99' }, '2026-10-01')).toThrow(/total/)
  })

  it('defaults a missing date to the current Warsaw day', () => {
    expect(warsawDate(new Date('2026-09-30T22:30:00Z'))).toBe('2026-10-01')
    expect(normalizeReceipt(base, '2026-10-01').spent_on).toBe('2026-10-01')
  })

  it('treats differently ordered and capitalized items as one fingerprint', () => {
    const first = normalizeReceipt(base, '2026-10-01')
    const second = normalizeReceipt({
      merchant: 'market',
      items: [
        { name: ' milk ', quantity: 2, amount_pln: '12.00', category: 'groceries' },
        { name: 'BREAD', quantity: 1, amount_pln: '8.00', category: 'groceries' }
      ]
    }, '2026-10-01')
    expect(first.fingerprint).toBe(fingerprintReceipt(second))
  })
})

export type ReceiptInput = {
  spent_on?: string
  merchant?: string | null
  total_pln?: string
  items: Array<{ name: string; quantity: number; amount_pln?: string; category: string }>
}

export type NormalizedReceipt = {
  spent_on: string
  merchant: string | null
  total_grosz: number
  items: Array<{ name: string; quantity: number; amount_grosz: number; category: string }>
  fingerprint: string
}

const categories = new Set<string>(CATEGORY_KEYS)

export function parsePlnAmount(text: string): number {
  const match = /^(-?)(\d{1,8})(?:[,.](\d{1,2}))?$/.exec(text.trim())
  if (!match) throw new Error('invalid decimal amount')
  const groszy = Number(match[2]) * 100 + Number((match[3] ?? '').padEnd(2, '0') || 0)
  const signed = match[1] ? -groszy : groszy
  if (!Number.isSafeInteger(signed) || signed < -2147483648 || signed > 2147483647) {
    throw new Error('amount out of range')
  }
  return signed
}

export function warsawDate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now)
  const part = (type: string) => parts.find((value) => value.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
}

function compact(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function categoryForItem(name: string, category: string): string {
  const beer = /(^|[^\p{L}])(piwo|beer|bier|пиво)(?=$|[^\p{L}])/iu.test(name)
  if (!beer) return category
  const nonalcoholic = /bezalkohol|non.?alcoholic|(^|[^\p{L}])zero(?=$|[^\p{L}])|(^|[^\d])0(?:[,.]0)?\s*%/iu.test(name)
  return nonalcoholic ? 'groceries' : 'alcohol'
}

export function normalizeReceipt(input: ReceiptInput, todayWarsaw: string): NormalizedReceipt {
  const spent_on = input.spent_on ?? todayWarsaw
  if (!validDate(spent_on)) throw new Error('invalid date')
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 200) {
    throw new Error('at least one item is required')
  }
  const merchant = input.merchant ? compact(input.merchant) || null : null
  if (merchant && merchant.length > 200) throw new Error('merchant too long')
  const items = input.items.map((item) => {
    const name = compact(item.name ?? '')
    if (!name || name.length > 200) throw new Error('invalid item name')
    if (!Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity > 999999999 || Math.round(item.quantity * 1000) !== item.quantity * 1000) {
      throw new Error('invalid quantity')
    }
    if (!categories.has(item.category)) throw new Error('invalid category')
    if (item.amount_pln == null || item.amount_pln.trim() === '') throw new Error('missing item price')
    const amount_grosz = parsePlnAmount(item.amount_pln)
    if (amount_grosz === 0) throw new Error('zero item price')
    return { name, quantity: item.quantity, amount_grosz, category: categoryForItem(name, item.category) }
  })
  const total_grosz = items.reduce((sum, item) => sum + item.amount_grosz, 0)
  if (total_grosz < -2147483648 || total_grosz > 2147483647) throw new Error('total out of range')
  if (input.total_pln != null && parsePlnAmount(input.total_pln) !== total_grosz) {
    throw new Error('receipt total differs from item sum')
  }
  const receipt: NormalizedReceipt = { spent_on, merchant, total_grosz, items, fingerprint: '' }
  receipt.fingerprint = fingerprintReceipt(receipt)
  return receipt
}

export function fingerprintReceipt(receipt: NormalizedReceipt): string {
  const canonical = [
    receipt.spent_on,
    receipt.merchant?.toLocaleLowerCase('pl-PL').replace(/\s+/g, ' ') ?? '',
    String(receipt.total_grosz),
    ...receipt.items.map((item) => `${item.name.toLocaleLowerCase('pl-PL').replace(/\s+/g, ' ')}:${item.quantity.toFixed(3)}:${item.amount_grosz}`).sort()
  ].join('|')
  let hash = 0xcbf29ce484222325n
  for (const byte of new TextEncoder().encode(canonical)) {
    hash ^= BigInt(byte)
    hash = BigInt.asUintN(64, hash * 0x100000001b3n)
  }
  return hash.toString(16).padStart(16, '0')
}
import { CATEGORY_KEYS } from './categories.ts'

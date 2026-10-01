import type { McpServer } from 'npm:@modelcontextprotocol/server@^2.0.0'
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@^4.3.6'
import { normalizeReceipt, warsawDate } from '../_shared/expense.ts'

const category = z.enum(['groceries', 'dining', 'home', 'transport', 'health', 'clothing', 'other'])
const item = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().positive().default(1),
  amount_pln: z.string().min(1).describe('Full line amount in PLN, e.g. 12,50. Ask the user if unreadable.'),
  category
})
const receipt = z.object({
  spent_on: z.string().optional().describe('YYYY-MM-DD; omit when no date is visible.'),
  merchant: z.string().max(200).optional(),
  total_pln: z.string().optional().describe('Printed receipt total when visible.'),
  items: z.array(item).min(1).max(200)
})
const receiptColumns = 'id, spent_on, merchant, currency, total_grosz, created_at, expense_items(id, name, quantity, amount_grosz, category, position)'
const oauth = [{ type: 'oauth2' as const, scopes: [] }]

function result(data: Record<string, unknown>, message: string) {
  return { structuredContent: data, content: [{ type: 'text' as const, text: message }] }
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown expense error'
  return { isError: true, content: [{ type: 'text' as const, text: message }] }
}

export function registerExpenseTools(server: McpServer, supabase: SupabaseClient) {
  server.registerTool('record_receipt', {
    title: 'Record expense receipt',
    description: 'Save purchases from a photo or text already interpreted in this chat. Include every readable line and the printed total. Ask the user before calling if a price is unreadable or the printed total disagrees. A possible duplicate is not saved until the user confirms a repeat.',
    inputSchema: receipt.extend({
      submission_id: z.string().uuid().describe('Stable UUID for this one user submission; reuse it on retries.'),
      allow_duplicate: z.boolean().default(false).describe('Set true only after the user confirms a real repeat purchase.')
    }),
    outputSchema: { status: z.enum(['created', 'replayed', 'duplicate_candidate']), receipt_id: z.string().uuid() },
    _meta: { securitySchemes: oauth },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
  }, async (input) => {
    try {
      const normalized = normalizeReceipt(input, warsawDate(new Date()))
      const { data, error } = await supabase.rpc('create_expense_receipt', {
        p_submission_id: input.submission_id,
        p_spent_on: normalized.spent_on,
        p_merchant: normalized.merchant,
        p_total_grosz: normalized.total_grosz,
        p_items: normalized.items,
        p_fingerprint: normalized.fingerprint,
        p_allow_duplicate: input.allow_duplicate
      })
      if (error) throw new Error(error.message)
      const receiptResult = data as { status: 'created' | 'replayed' | 'duplicate_candidate'; receipt_id: string }
      const message = receiptResult.status === 'duplicate_candidate'
        ? 'Похожий чек уже записан. Уточните у пользователя, нужно ли сохранить повторную покупку.'
        : `Чек сохранён: ${normalized.items.length} позиций, ${(normalized.total_grosz / 100).toFixed(2)} PLN.`
      return result(receiptResult, message)
    } catch (error) { return failure(error) }
  })

  server.registerTool('recent_receipts', {
    title: 'Recent expense receipts',
    description: 'List recent receipts belonging to the signed-in user, including their line items.',
    inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(10) }),
    outputSchema: { receipts: z.array(z.unknown()) },
    _meta: { securitySchemes: oauth },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ limit }) => {
    try {
      const { data, error } = await supabase.from('expense_receipts').select(receiptColumns)
        .order('spent_on', { ascending: false }).order('created_at', { ascending: false }).limit(limit)
      if (error) throw new Error(error.message)
      return result({ receipts: data ?? [] }, `Найдено чеков: ${data?.length ?? 0}.`)
    } catch (error) { return failure(error) }
  })

  server.registerTool('receipt_details', {
    title: 'Expense receipt details',
    description: 'Read one receipt and its line items by ID for the signed-in user.',
    inputSchema: z.object({ receipt_id: z.string().uuid() }),
    outputSchema: { receipt: z.unknown() },
    _meta: { securitySchemes: oauth },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ receipt_id }) => {
    try {
      const { data, error } = await supabase.from('expense_receipts').select(receiptColumns).eq('id', receipt_id).single()
      if (error) throw new Error(error.code === 'PGRST116' ? 'Receipt not found' : error.message)
      return result({ receipt: data }, 'Данные чека получены.')
    } catch (error) { return failure(error) }
  })

  server.registerTool('replace_receipt', {
    title: 'Correct an expense receipt',
    description: 'Replace the date, merchant and complete line-item list of an existing receipt after the user requests a correction. Read the receipt first to preserve unchanged lines.',
    inputSchema: receipt.extend({
      receipt_id: z.string().uuid(),
      spent_on: z.string().min(10).describe('Required original or corrected YYYY-MM-DD date.'),
      merchant: z.string().max(200).nullable().describe('Required original or corrected merchant, or null.')
    }),
    outputSchema: { status: z.literal('updated'), receipt_id: z.string().uuid() },
    _meta: { securitySchemes: oauth },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
  }, async (input) => {
    try {
      const normalized = normalizeReceipt(input, warsawDate(new Date()))
      const { data, error } = await supabase.rpc('replace_expense_receipt', {
        p_receipt_id: input.receipt_id,
        p_spent_on: normalized.spent_on,
        p_merchant: normalized.merchant,
        p_total_grosz: normalized.total_grosz,
        p_items: normalized.items,
        p_fingerprint: normalized.fingerprint
      })
      if (error) throw new Error(error.message)
      return result(data as { status: 'updated'; receipt_id: string }, 'Чек исправлен.')
    } catch (error) { return failure(error) }
  })

  server.registerTool('delete_receipt', {
    title: 'Delete an expense receipt',
    description: 'Permanently delete a receipt only when the user explicitly requests deletion of that identified receipt.',
    inputSchema: z.object({ receipt_id: z.string().uuid(), confirm: z.literal(true) }),
    outputSchema: { deleted: z.boolean() },
    _meta: { securitySchemes: oauth },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false }
  }, async ({ receipt_id }) => {
    try {
      const { data, error } = await supabase.rpc('delete_expense_receipt', { p_receipt_id: receipt_id })
      if (error) throw new Error(error.message)
      return result({ deleted: data === true }, data === true ? 'Чек удалён.' : 'Чек не удалён.')
    } catch (error) { return failure(error) }
  })
}

import type { SupabaseClient } from '@supabase/supabase-js';
import { monthBounds, type ReceiptWithItems } from './stats';

const columns = 'id, spent_on, merchant, currency, total_grosz, created_at, expense_items(id, name, quantity, amount_grosz, category, position)';

export async function loadMonthReceipts(client: SupabaseClient, month: string): Promise<ReceiptWithItems[]> {
  const { priorStart, nextStart } = monthBounds(month);
  const receipts: ReceiptWithItems[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from('expense_receipts').select(columns)
      .gte('spent_on', priorStart).lt('spent_on', nextStart)
      .order('spent_on', { ascending: false }).order('created_at', { ascending: false })
      .order('id', { ascending: false }).range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Не удалось загрузить расходы: ${error.message}`);
    receipts.push(...((data ?? []) as ReceiptWithItems[]));
    if (!data || data.length < pageSize) break;
  }
  return receipts;
}

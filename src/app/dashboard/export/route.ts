import { CATEGORY_LABELS, type Category, summarizeMonth } from '../../../lib/stats';
import { createServerClient } from '../../../lib/supabase/server';
import { loadMonthReceipts } from '../../../lib/expenses';
import { getPreferences } from '../../../lib/preferences';
import { expensesCsv } from '../../../lib/csv';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';
  const category = url.searchParams.get('category');
  if (!/^(20[2-9]\d)-(0[1-9]|1[0-2])$/.test(month) || (category !== null && !Object.hasOwn(CATEGORY_LABELS, category))) {
    return new Response('Invalid month or category', { status: 400 });
  }
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return new Response('Unauthorized', { status: 401 });
  try {
    const receipts = await loadMonthReceipts(supabase, month);
    const { locale } = await getPreferences();
    const summary = summarizeMonth(receipts, month, `${month}-01`);
    return new Response(expensesCsv(summary.recent, locale, category ? category as Category : undefined), { headers: {
      'Content-Type':'text/csv; charset=utf-8',
      'Content-Disposition':`attachment; filename="expenses-${month}${category ? `-${category}` : ''}.csv"`,
      'Cache-Control':'private, no-store',
      'X-Content-Type-Options':'nosniff',
    } });
  } catch {
    return new Response('Export unavailable. Please try again.', { status: 500, headers: { 'Cache-Control':'no-store' } });
  }
}

import { redirect } from 'next/navigation';
import { createServerClient } from './supabase/server';
import { loadMonthReceipts } from './expenses';
import { summarizeMonth } from './stats';
import { getPreferences } from './preferences';

export function selectedMonth(requested?: string) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return requested && /^(20[2-9]\d)-(0[1-9]|1[0-2])$/.test(requested) ? requested : today.slice(0,7);
}
export async function loadDashboard(requested?: string, path = '/dashboard') {
  const month = selectedMonth(requested);
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect(`/login?redirect=${encodeURIComponent(`${path}?month=${month}`)}`);
  const receipts = await loadMonthReceipts(supabase, month);
  return { summary: summarizeMonth(receipts, month, `${month}-01`), ...await getPreferences() };
}

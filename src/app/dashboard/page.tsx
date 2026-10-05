import { redirect } from 'next/navigation';
import { DashboardView } from '../../components/dashboard-view';
import { getPreferences } from '../../lib/preferences';
import { messages } from '../../lib/i18n';
import { loadMonthReceipts } from '../../lib/expenses';
import { createServerClient } from '../../lib/supabase/server';
import { monthBounds, summarizeMonth } from '../../lib/stats';
import { signOut } from './actions';

export const dynamic = 'force-dynamic';

function todayWarsaw() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const today = todayWarsaw();
  const requested = (await searchParams).month;
  const month = requested && /^\d{4}-(0[1-9]|1[0-2])$/.test(requested) ? requested : today.slice(0, 7);
  monthBounds(month);
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect('/login?redirect=%2Fdashboard');
  const receipts = await loadMonthReceipts(supabase, month);
  const summary = summarizeMonth(receipts, month, today);
  const preferences = await getPreferences();
  return <DashboardView summary={summary} {...preferences} signOut={<form action={signOut}><button className="signout" type="submit">{messages[preferences.locale].signOut}</button></form>} />;
}

import { redirect } from 'next/navigation';
import { CategoryBreakdown } from '../../components/category-breakdown';
import { DailyChart } from '../../components/daily-chart';
import { ExpenseSummary } from '../../components/expense-summary';
import { ReceiptList } from '../../components/receipt-list';
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
  const title = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));
  return <main className="dashboard-shell">
    <header className="site-header"><a className="brand" href="/dashboard"><span className="brand-mark">◈</span><span>расходы<span className="brand-dot">.</span></span></a><form action={signOut}><button className="signout" type="submit">Выйти</button></form></header>
    <div className="page-content">
      <div className="page-top"><div><span className="eyebrow page-eyebrow">Личный обзор</span><h1>Ваши расходы</h1><p>Все покупки на одной странице.</p></div>
        <form className="month-form" action="/dashboard" method="get"><label htmlFor="month">Месяц</label><input id="month" name="month" type="month" defaultValue={month} min="2020-01" max="2099-12" /><button type="submit">Показать</button></form>
      </div>
      <div className="month-title"><span className="month-rule" /><h2>{title}</h2><span className="month-rule" /></div>
      <ExpenseSummary summary={summary} />
      <div className="insights-grid"><DailyChart daily={summary.daily} /><CategoryBreakdown categories={summary.categories} /></div>
      <ReceiptList receipts={summary.recent} />
      <footer className="site-footer">Суммы в PLN · Даты по времени Варшавы</footer>
    </div>
  </main>;
}

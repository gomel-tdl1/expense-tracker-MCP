import { CategoryInsights } from './category-insights';
import { DailyChart } from './daily-chart';
import { ExpenseSummary } from './expense-summary';
import { ReceiptList } from './receipt-list';
import { Brand, BeatStrip } from './brand';
import { Preferences } from './preferences';
import { formatDate, messages, type Locale } from '../lib/i18n';
import type { MonthSummary } from '../lib/stats';
import type { ReactNode } from 'react';

export function DashboardView({ summary, locale, theme, motion, signOut }: {
  summary: MonthSummary; locale: Locale; theme: 'light' | 'dark'; motion: boolean; signOut: ReactNode;
}) {
  const t = messages[locale];
  return <div className="dashboard-shell">
    <a className="skip-link" href="#overview">{t.skip}</a>
    <header className="site-header"><Brand locale={locale} /><BeatStrip /><div className="header-actions"><Preferences initialTheme={theme} initialMotion={motion} />{signOut}</div></header>
    <div className="workspace">
      <aside className="sidebar">
        <nav aria-label={t.overview}>
          <a className="nav-link" href="#overview"><span aria-hidden="true">⌂</span>{t.overview}<small>01</small></a>
          <a className="nav-link" href="#categories"><span aria-hidden="true">▥</span>{t.categories}<small>02</small></a>
          <a className="nav-link" href="#purchases"><span aria-hidden="true">≡</span>{t.purchases}<small>03</small></a>
        </nav>
        <div className="sidebar-art" aria-hidden="true"><div className="binary">01001010<br />10010101<br />00110100</div><strong>LESS<br />NOISE.<br /><em>MORE</em><br /><em>CLARITY.</em></strong><div className="mini-wave">{[3, 8, 4, 12, 7, 17, 9, 5, 13, 6, 18, 8, 4, 11, 6].map((h, i) => <i key={i} style={{ height: h }} />)}</div><span>DRUM & BASS<br />FINANCES IN SYNC</span></div>
      </aside>
      <main className="page-content" id="overview" tabIndex={-1}>
        <div className="page-top"><div><span className="eyebrow"><span className="status-dot" />{t.personal}</span><h1>{t.title}</h1><p>{t.subtitle}</p></div>
          <form className="month-form" action="/dashboard" method="get"><label htmlFor="month">{t.month}</label><div><input id="month" name="month" type="month" defaultValue={summary.month} key={summary.month} min="2020-01" max="2099-12" required /><button type="submit">{t.show}<span aria-hidden="true"> ↗</span></button></div></form>
        </div>
        <div className="month-title"><span className="track-number">SIDE A</span><h2>{formatDate(`${summary.month}-01`, locale, true)}</h2><span className="month-rule" /><span aria-hidden="true">PLN / WAW</span></div>
        <ExpenseSummary summary={summary} locale={locale} />
        <CategoryInsights key={summary.month} categories={summary.categories} receipts={summary.recent} locale={locale}><DailyChart daily={summary.daily} locale={locale} month={summary.month} /></CategoryInsights>
        <ReceiptList receipts={summary.recent} locale={locale} />
        <footer className="site-footer"><span>{t.footer}</span><span aria-hidden="true">0101 · KEEP TRACK / STAY IN SYNC</span></footer>
      </main>
    </div>
  </div>;
}

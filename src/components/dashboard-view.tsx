import Link from 'next/link';
import { CategoryBreakdown } from './category-breakdown';
import { CategoryDetail } from './category-detail';
import { DailyChart } from './daily-chart';
import { ExpenseSummary, MonthlyTotal } from './expense-summary';
import { ReceiptList } from './receipt-list';
import { Brand, BeatStrip } from './brand';
import { Preferences } from './preferences';
import { Icon } from './icon';
import { categoryLabel, formatDate, formatMoney, messages, type Locale } from '../lib/i18n';
import { monthBounds, type Category, type MonthSummary } from '../lib/stats';
import type { ReactNode } from 'react';
export type DashboardSection = 'overview' | 'purchases' | 'categories';

export function DashboardView({ summary, locale, theme, motion, signOut, section='overview', category }: {
  summary: MonthSummary; locale: Locale; theme:'light'|'dark'; motion:boolean; signOut:ReactNode; section?:DashboardSection; category?:Category;
}) {
 const t=messages[locale];
 const path=category?`/dashboard/categories/${category}`:section==='overview'?'/dashboard':`/dashboard/${section}`;
 const title=category?categoryLabel(category,locale):section==='overview'?t.title:section==='purchases'?t.allPurchases:t.allCategories;
 const available=Array.from(new Set(summary.recent.flatMap(receipt=>receipt.expense_items.map(item=>item.category))));
 const bounds=monthBounds(summary.month);
 const comparisonTotal=summary.currentGrosz+summary.priorGrosz;
 const currentShare=summary.currentGrosz>=0 && summary.priorGrosz>=0 && comparisonTotal>0 ? summary.currentGrosz/comparisonTotal*100 : null;
 const csv=`/dashboard/export?month=${summary.month}${category?`&category=${category}`:''}`;
 const nav=[{key:'overview',label:t.overview,path:'/dashboard'},{key:'purchases',label:t.purchases,path:'/dashboard/purchases'},{key:'categories',label:t.categories,path:'/dashboard/categories'}];
 const monthPicker=<div className="month-picker">
   {summary.month>'2020-01'&&<Link className="month-arrow" aria-label={t.previous} href={`${path}?month=${bounds.priorStart.slice(0,7)}`}>‹</Link>}
   <span className="month-label">{formatDate(`${summary.month}-01`,locale,true)}</span>
   {summary.month<'2099-12'&&<Link className="month-arrow" aria-label={t.next} href={`${path}?month=${bounds.nextStart.slice(0,7)}`}>›</Link>}
   <details className="month-popover"><summary aria-label={t.month}>⌄</summary><form className="month-form" action={path} method="get"><label htmlFor="month">{t.month}</label><div><input id="month" name="month" type="month" defaultValue={summary.month} key={summary.month} min="2020-01" max="2099-12" required/><button type="submit">{t.show}</button></div></form></details>
 </div>;
 return <div className="dashboard-shell signal-shell">
  <a className="skip-link" href="#content">{t.skip}</a>
  <header className="site-header"><Brand locale={locale}/><div className="header-code" aria-hidden="true">01001010<br/>01000001<br/>STAY IN SYNC</div><BeatStrip/><div className="header-actions"><Preferences initialTheme={theme} initialMotion={motion}/>{signOut}</div></header>
  <div className="workspace"><aside className="sidebar"><nav aria-label={t.overview}>{nav.map(item=><Link key={item.key} className="nav-link" aria-current={section===item.key?'page':undefined} href={`${item.path}?month=${summary.month}`}><Icon name={item.key}/><span>{item.label}</span></Link>)}</nav>
   <div className="sidebar-art" aria-hidden="true"><div className="torn-poster">DRUM<br/>& BASS<br/><em>PAY LESS.<br/>LIVE MORE.</em></div><span>SMALL EXPENSES<br/>BIG FREEDOM</span><div className="binary">01001010101<br/>10101001011<br/>174 BPM</div><strong>GOOD<br/>CHOICES.<br/><em>BETTER</em><br/><em>BEATS.</em></strong></div>
  </aside><main className={`page-content view-${section}`} id="content" tabIndex={-1}>
   {section==='overview'?<>
    <div className="overview-top"><section className="panel overview-hero"><div className="overview-heading"><h1>{title}</h1>{monthPicker}</div><MonthlyTotal summary={summary} locale={locale}/><DailyChart daily={summary.daily} locale={locale} month={summary.month}/></section><CategoryBreakdown categories={summary.categories} locale={locale} month={summary.month} available={available} limit={5}/></div>
    <ExpenseSummary summary={summary} locale={locale}/>
    <div className="overview-bottom"><div className="recent-wrap"><div className="section-toolbar"><span>{t.recentShort}</span><Link className="text-link" href={`/dashboard/purchases?month=${summary.month}`}>{t.allPurchases}<Icon name="arrow"/></Link></div><ReceiptList receipts={summary.recent.slice(0,4)} locale={locale}/></div>
      <section className="panel month-pulse"><h2>{t.summary}</h2><div className="pulse-ring" style={{background:currentShare===null?"var(--line)":`conic-gradient(var(--accent) 0 ${currentShare}%, var(--muted) ${currentShare}% 100%)`}}><div><strong>{formatMoney(summary.currentGrosz,locale)}</strong><span>{t.monthTotal}</span></div></div><div className="pulse-legend"><span><i/>{t.monthTotal}</span><strong>{formatMoney(summary.currentGrosz,locale)}</strong></div><div className="pulse-legend prior"><span><i/>{t.priorMonth}</span><strong>{formatMoney(summary.priorGrosz,locale)}</strong></div></section></div>
   </>:<>
     <div className="section-page-heading"><div><span className="eyebrow">{t.personal}</span><h1>{title}</h1></div>{monthPicker}<a className="export-button" href={csv}><Icon name="download"/>{t.exportCsv}</a></div>
     {category?<CategoryDetail summary={summary} category={category} locale={locale}/>:section==='purchases'?<ReceiptList receipts={summary.recent} locale={locale}/>:<CategoryBreakdown categories={summary.categories} locale={locale} month={summary.month} available={available}/>}
   </>}
   <footer className="site-footer"><div className="footer-wave" aria-hidden="true">{[3,8,4,12,7,17,9,5,13,6,18,8,4,11,6].map((h,i)=><i key={i} style={{height:h}}/>)}</div><span>{t.footer}</span><span aria-hidden="true">010101 · KEEP TRACK · MOVE FORWARD</span></footer>
  </main></div>
 </div>;
}

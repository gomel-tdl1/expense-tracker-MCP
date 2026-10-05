export function Icon({ name, className = '' }: { name: string; className?: string }) {
  const paths: Record<string, string> = {
    overview: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
    purchases: 'M5 3h14v18l-3-2-4 2-4-2-3 2V3m3 5h8m-8 4h8m-8 4h4',
    categories: 'm12 3 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V8M12 13v10',
    groceries: 'M3 3h2l3 13h11l3-9H6m4 13h.01M18 20h.01',
    alcohol: 'M8 3h8l1 6a5 5 0 0 1-10 0l1-6Zm4 11v7m-4 0h8M8 7h8',
    fuel: 'M4 21V4h10v17M3 21h13M6 7h6v5H6m8-4 3 3v6a2 2 0 0 0 4 0V7l-3-3',
    cafes: 'M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8m12 1h2a3 3 0 0 1 0 6h-2M7 3v2m4-2v2',
    subscriptions: 'M4 5h16v14H4V5m6 4 5 3-5 3V9',
    average: 'M4 8h16M4 16h16M9 3 6 21M18 3l-3 18',
    largest: 'M5 20C5 7 13 4 21 3c0 9-4 16-12 16m-4 2L17 8',
    download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
    arrow: 'M5 12h14m-5-5 5 5-5 5',
  };
  return <svg className={`line-icon ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.categories} /></svg>;
}

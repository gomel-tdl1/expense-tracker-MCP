'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return <main className="dashboard-shell"><div className="page-content error-page"><h1>Не удалось загрузить расходы</h1><p role="alert">{error.message}</p><button onClick={reset}>Повторить</button></div></main>;
}

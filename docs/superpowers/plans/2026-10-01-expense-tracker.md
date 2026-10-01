# Expense Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Записывать позиции с фото или текста через MCP в Supabase и показывать личную статистику расходов на сайте Vercel.

**Architecture:** Next.js 16 отвечает за вход, OAuth consent и закрытую страницу статистики. Supabase хранит документы и позиции, выдаёт пользовательские токены и запускает MCP Edge Function; все операции с данными выполняются от имени пользователя под RLS. Модель читает изображение в чате и передаёт в MCP только структурированные поля.

**Tech Stack:** TypeScript, Next.js 16, React, Supabase Auth/Database/Edge Functions, MCP TypeScript SDK v2, Zod v4, Vitest, pgTAP, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-01-expense-tracker-design.md`

## Global Constraints

- Валюта только `PLN`; суммы в базе — целые гроши, интерфейс показывает две десятичные цифры.
- Ключи категорий: `groceries`, `dining`, `home`, `transport`, `health`, `clothing`, `other`; пользовательские подписи: продукты, кафе, дом, транспорт, здоровье, одежда, другое.
- Даты и границы календарных месяцев трактуются в `Europe/Warsaw`; при отсутствии даты используется текущая дата этого пояса.
- Фото и полный текст беседы не сохраняются; распознавание происходит в ChatGPT/Codex до вызова MCP.
- Сайт на Vercel предназначен для чтения; исправление и удаление доступны через MCP в чате.
- Supabase — единственный поставщик базы и Auth; MCP размещён как Supabase Edge Function.
- Вход на сайт — email magic link; OAuth 2.1 и динамическая регистрация клиентов защищают MCP; RLS разделяет данные пользователей.
- Первая версия не включает мессенджеры, мультивалютность и самостоятельный OCR на сервере.

## Review Focus

1. Фото без читаемой цены: `record_receipt` отвергает отсутствующую сумму без вставки; проверка в Task 2.
2. Повтор вызова и два действительно одинаковых чека: повтор `submission_id` возвращает прежний документ, совпадение fingerprint требует `allow_duplicate`; проверки в Task 1.
3. Пользователь B пытается читать или менять данные A: RLS и RPC возвращают отказ/пустой результат; проверки в Task 1.
4. Скидка или возврат и расхождение с напечатанным итогом: signed суммы учитываются, несовпадение отвергается; проверки в Task 2 и Task 4.
5. Фото без даты у границы месяца по времени Варшавы: получает верную локальную дату; проверка в Task 2.

---

## File Map

- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vitest.config.ts`: Next.js и команды сборки/тестов.
- `supabase/config.toml`: локальный Auth OAuth 2.1, consent path, MCP без проверки JWT на gateway (токен проверяет middleware функции).
- `supabase/migrations/20261001000000_expenses.sql`: таблицы, индексы, RLS и атомарные RPC.
- `supabase/tests/database/expenses.test.sql`: pgTAP проверки целостности и доступа.
- `supabase/functions/_shared/expense.ts`: разбор PLN, проверка и fingerprint документа.
- `supabase/functions/mcp/index.ts`, `tools.ts`: OAuth middleware, MCP transport и инструменты.
- `src/lib/supabase/{browser,server}.ts`, `src/proxy.ts`, `src/app/{login,auth/callback,oauth/consent}/...`: сессия сайта и OAuth consent.
- `src/lib/{expenses,stats}.ts`, `src/app/dashboard/...`, `src/components/...`: выборка и визуализация статистики.
- `tests/{expense,stats,auth}.test.ts`, `README.md`, `.env.example`: тесты, запуск и развёртывание.

### Task 1: База, атомарная запись и доступ

**Files:** Create `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vitest.config.ts`, `supabase/config.toml`, `supabase/migrations/20261001000000_expenses.sql`, `supabase/tests/database/expenses.test.sql`.

**Interfaces:**
- `expense_receipts(id, user_id, spent_on, merchant, currency, total_grosz, submission_id, fingerprint, created_at)` и `expense_items(id, receipt_id, name, quantity, amount_grosz, category, position)`; `currency` всегда `PLN`.
- `create_expense_receipt(p_submission_id uuid, p_spent_on date, p_merchant text, p_total_grosz integer, p_items jsonb, p_fingerprint text, p_allow_duplicate boolean) returns jsonb` со статусом `created | replayed | duplicate_candidate` и `receipt_id`.
- `p_items` — массив объектов `{name: string, quantity: number, amount_grosz: integer, category: string}`; SQL сохраняет порядок массива в `position`.
- `replace_expense_receipt(p_receipt_id uuid, p_spent_on date, p_merchant text, p_total_grosz integer, p_items jsonb, p_fingerprint text) returns jsonb`; `delete_expense_receipt(p_receipt_id uuid) returns boolean`.
- SQL функции получают владельца только из `auth.uid()`, проверяют непустой список и равенство суммы позиций итогу, сохраняют родителя и позиции атомарно. `SECURITY DEFINER` функции ограничивают `search_path` и проверяют владельца явно.

- [ ] **Step 1: Write failing pgTAP tests.** Assert that a two-line receipt totaling `2000` groszy is created with two items; mismatched total inserts nothing; the same `submission_id` returns `replayed`; equal fingerprint returns `duplicate_candidate`, while `allow_duplicate=true` creates a second record; user B cannot read, replace or delete user A's record.
- [ ] **Step 2: Run tests to see expected failure.** `pnpm supabase start && pnpm supabase test db`; expect missing tables/functions or failed assertions.
- [ ] **Step 3: Add minimal project setup and SQL migration.** Install pinned Next.js 16, React, Supabase CLI and test dependencies; initialize Supabase config with OAuth server enabled, `/oauth/consent`, dynamic registration, and `[functions.mcp] verify_jwt = false`; implement tables, constraints, RLS and RPC signatures above.
- [ ] **Step 4: Re-run database tests.** `pnpm supabase db reset && pnpm supabase test db`; expect all assertions pass. Also run `pnpm supabase db lint --level error`.
- [ ] **Step 5: Commit.** `git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts supabase && git commit -m "feat: add expense database and access rules"`.

### Task 2: Разбор сумм и защищённые MCP инструменты

**Files:** Create `supabase/functions/_shared/expense.ts`, `supabase/functions/mcp/index.ts`, `supabase/functions/mcp/tools.ts`, `tests/expense.test.ts`; modify `package.json`.

**Interfaces:**
- `parsePlnAmount(text: string): number` принимает `12,50`, `12.50`, `12,5`, `-2,00`, возвращает гроши; отклоняет более двух знаков после разделителя, нечисловое и значения вне SQL integer.
- `warsawDate(now: Date): string` возвращает `YYYY-MM-DD` в `Europe/Warsaw` для даты по умолчанию.
- `normalizeReceipt(input: ReceiptInput, todayWarsaw: string): NormalizedReceipt` проверяет позиции `{name, quantity, amount_pln, category}`, допустимые категории и объявленный `total_pln`; возвращает `spent_on`, `merchant`, `total_grosz`, позиции и fingerprint. Позиции без цены не проходят.
- `fingerprintReceipt(receipt: NormalizedReceipt): string` устойчив к регистру/лишним пробелам магазина и имён и порядку позиций.
- MCP инструменты: `record_receipt` (включая UUID `submission_id`, необязательный `allow_duplicate`), `recent_receipts`, `receipt_details`, `replace_receipt`, `delete_receipt` (требует `confirm: true`). Ответы включают структурированный результат и краткий текст для модели. Аннотации честно отмечают чтение, запись и удаление.

- [ ] **Step 1: Write failing domain tests.** Assert `parsePlnAmount('12,5') === 1250`, `parsePlnAmount('-2,00') === -200`, invalid `1,234` throws; a missing price and a declared total different from line sum throw; two receipts with reordered/case-changed items get one fingerprint; `warsawDate(new Date('2026-09-30T22:30:00Z')) === '2026-10-01'` and a receipt without date uses it.
- [ ] **Step 2: Run the focused tests.** `pnpm vitest run tests/expense.test.ts`; expect failures from missing exports.
- [ ] **Step 3: Implement domain and MCP.** Use `createMcpHandler` and `McpServer` from `@modelcontextprotocol/server@2`, `pipeline`, `withOAuthProtectedResource()` and `withSupabase({auth:'user'})` as in Supabase's MCP guide. Register the five tools with Zod v4 schemas; call Task 1 RPC for writes and RLS-scoped selects for reads. Do not include any service-role key or image parameter.
- [ ] **Step 4: Verify.** `pnpm vitest run tests/expense.test.ts` passes; `pnpm supabase functions serve mcp` plus an unauthenticated MCP POST returns `401` with `WWW-Authenticate`, and the protected-resource metadata is reachable. Use MCP Inspector with an authenticated local user to list tools and exercise create, read, replace and delete.
- [ ] **Step 5: Commit.** `git add supabase/functions tests/expense.test.ts package.json pnpm-lock.yaml && git commit -m "feat: expose expense MCP tools"`.

### Task 3: Вход и экран согласия

**Files:** Create `src/lib/supabase/browser.ts`, `src/lib/supabase/server.ts`, `src/proxy.ts`, `src/app/layout.tsx`, `src/app/login/page.tsx`, `src/app/auth/callback/route.ts`, `src/app/oauth/consent/page.tsx`, `src/app/oauth/consent/actions.ts`, `tests/auth.test.ts`; modify `package.json`.

**Interfaces:**
- `createBrowserClient()` and `createServerClient()` wrap `@supabase/ssr` with public URL/publishable key and cookie session storage.
- `/login?redirect=<local path>` sends an email magic link and preserves only a same-origin path. `/auth/callback` exchanges the PKCE code and returns to that path.
- `/oauth/consent?authorization_id=<id>` requires a signed-in user, calls `getAuthorizationDetails(id)`, displays client and scopes, then calls `approveAuthorization(id)` or `denyAuthorization(id)`; missing/invalid IDs show an error. `src/proxy.ts` refreshes the session for protected routes in Next.js 16.

- [ ] **Step 1: Write failing auth tests.** Assert an unauthenticated `/dashboard` or consent visit goes to `/login`; `redirect=https://evil.example` is rejected in favor of `/dashboard`; a valid authorization displays client name and scopes; deny invokes `denyAuthorization`, never approve; invalid `authorization_id` shows an error.
- [ ] **Step 2: Run tests.** `pnpm vitest run tests/auth.test.ts`; expect missing route/helper failures.
- [ ] **Step 3: Implement auth pages and consent actions.** Use Supabase SSR cookie clients and the documented `supabase.auth.oauth.*` methods. Preserve the OAuth `authorization_id` across login, avoid open redirects, and show loading/error states. Use email OTP PKCE flow; production setup must provide SMTP because Supabase's default sender is development-only.
- [ ] **Step 4: Verify.** `pnpm vitest run tests/auth.test.ts && pnpm tsc --noEmit && pnpm build` passes. With the local Supabase stack, obtain a magic link via Mailpit, sign in, then approve and deny separate test authorizations.
- [ ] **Step 5: Commit.** `git add src package.json pnpm-lock.yaml tests/auth.test.ts && git commit -m "feat: add sign-in and MCP consent"`.

### Task 4: Статистика и сайт

**Files:** Create `src/lib/expenses.ts`, `src/lib/stats.ts`, `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/loading.tsx`, `src/app/dashboard/error.tsx`, `src/app/globals.css`, `src/components/expense-summary.tsx`, `src/components/daily-chart.tsx`, `src/components/category-breakdown.tsx`, `src/components/receipt-list.tsx`, `tests/stats.test.ts`.

**Interfaces:**
- `loadMonthReceipts(client, month: string): Promise<ReceiptWithItems[]>` queries only the signed-in user's month plus prior month for comparison; RLS remains the authorization boundary.
- `summarizeMonth(receipts: ReceiptWithItems[], month: string, todayWarsaw: string): MonthSummary` returns current/prior totals, per-day totals, per-category net totals and recent receipts. `month` is `YYYY-MM` in Warsaw; the prior month is the full calendar month.
- `/dashboard?month=YYYY-MM` shows total PLN, comparison, daily chart, categories and recent documents; selecting a document reveals its positions. Empty and failed loads remain visibly distinct.

- [ ] **Step 1: Write failing stats tests.** Assert `2026-09-30` and `2026-10-01` land in different months; a `-200` groszy discount reduces net from `1200` to `1000`; an empty month totals `0` with no bars; prior month comparison uses the entire prior calendar month.
- [ ] **Step 2: Run tests.** `pnpm vitest run tests/stats.test.ts`; expect missing exports.
- [ ] **Step 3: Implement data query and responsive dashboard.** Format monetary values with `pl-PL` and `PLN`; expose no private data in a public or cached response. Use a simple chart built from semantic HTML/CSS or a small chart dependency only if needed. Keep the site read-only.
- [ ] **Step 4: Verify.** `pnpm vitest run tests/stats.test.ts && pnpm tsc --noEmit && pnpm build` passes. In a browser at desktop and mobile widths, check empty state, a seeded receipt, category totals, month selection, details and explicit load error.
- [ ] **Step 5: Commit.** `git add src tests/stats.test.ts package.json pnpm-lock.yaml && git commit -m "feat: show spending dashboard"`.

### Task 5: Reproducible setup and end-to-end check

**Files:** Create `.env.example`, `.gitignore`, `README.md`, `docs/deployment.md`; modify any code revealed by integration checks.

**Interfaces:** `.env.example` lists only public Supabase URL/key and server-side configuration names, never real secrets. `README.md` gives local commands and explains the ChatGPT/Codex MCP connection requirement; `docs/deployment.md` covers Supabase migration/function deployment, OAuth settings, SMTP, Vercel environment and smoke checks.

- [ ] **Step 1: Write a setup acceptance checklist in `docs/deployment.md`.** Include: fresh clone, `pnpm install`, `pnpm supabase start`, `pnpm supabase db reset`, local email login, OAuth discovery and consent, one `record_receipt` call, visible dashboard total, duplicate and correction.
- [ ] **Step 2: Follow the checklist locally before completing documentation.** Note commands or settings that fail; do not treat missing production credentials as a passing remote check.
- [ ] **Step 3: Complete example env, ignore rules and setup docs.** Document the exact Supabase Auth Site URL and `/oauth/consent`, dynamic client registration, asymmetric JWT signing key requirement, MCP function URL, and how to enable the connection in ChatGPT/Codex. Mark production SMTP and account access as deployment prerequisites.
- [ ] **Step 4: Run final verification.** `pnpm vitest run && pnpm supabase test db && pnpm supabase db lint --level error && pnpm tsc --noEmit && pnpm build`; then use MCP Inspector and a local browser for the complete receipt flow. After user-provided Supabase/Vercel project access, repeat the photo-in-chat → MCP → dashboard smoke test on deployed URLs.
- [ ] **Step 5: Commit.** `git add .env.example .gitignore README.md docs package.json pnpm-lock.yaml src supabase tests && git commit -m "docs: make expense tracker deployable"`.

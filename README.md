# Расходы через чат

Личный учёт покупок в PLN. Вы отправляете в ChatGPT или Codex фото чека либо текстовый список; модель читает позиции и сохраняет их через подключённый MCP сервер. Сайт показывает итог за месяц, прошлый месяц, расходы по дням и категориям, а также позиции каждого документа. Фото не загружаются в Supabase.

> Подключение MCP нужно включить в клиенте и, возможно, выбрать в новой беседе. Сам сайт не может сделать инструмент доступным во всех чатах.

## Локальный запуск

Нужны Node.js 20+, pnpm и запущенный Docker. Supabase CLI устанавливается вместе с зависимостями.

```bash
pnpm install
pnpm supabase start
pnpm supabase db reset
pnpm supabase status -o env
```

Создайте `.env.local` по образцу `.env.example`. Возьмите `API_URL` для `NEXT_PUBLIC_SUPABASE_URL`, `PUBLISHABLE_KEY` для `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Ключ `SERVICE_ROLE_KEY` и другие секреты не нужны приложению и не должны попадать в `.env.local` Vercel.

В двух терминалах:

```bash
pnpm supabase functions serve mcp
pnpm dev
```

Перед входом создайте пользователя с email и паролем в локальном Supabase Studio (`http://127.0.0.1:54323`, Authentication → Users → Add user). Откройте `http://localhost:3000/login` и войдите с этими данными. Локальный MCP URL: `http://127.0.0.1:54321/functions/v1/mcp`. Для подключения ChatGPT нужен публичный HTTPS URL после развёртывания.

## Что просить в чате

После подключения MCP отправьте фото и напишите: «Запиши покупки с этого чека. Если цена не читается или сумма строк расходится с итогом, уточни перед записью». Для исправления: «Покажи последние чеки и исправь позицию в нужном чеке». Удаление запрашивайте явно. Дубли без подтверждения не сохраняются.

## Проверки

```bash
pnpm test
pnpm supabase test db
pnpm supabase db lint --level error
pnpm tsc --noEmit
pnpm build
```

Подробные настройки Supabase, Vercel и подключения к чату: [docs/deployment.md](docs/deployment.md).

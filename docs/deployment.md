# Развёртывание и приёмка

## Локальная приёмка

- [x] Чистая рабочая копия: `pnpm install`.
- [x] Запустить локальный Supabase: `pnpm supabase start`, затем `pnpm supabase db reset`.
- [x] Создать `.env.local` по `.env.example` с локальными `API_URL` и `PUBLISHABLE_KEY` из `pnpm supabase status -o env`; запустить `pnpm dev`.
- [ ] Создать пользователя с паролем в Authentication → Users, войти через `/login` и увидеть пустой `/dashboard`.
- [x] Проверить OAuth discovery, регистрацию клиента, отдельные разрешение и отказ через API Supabase Auth. Экран `/oauth/consent` собран и прошёл TypeScript/Next build; реальный браузерный OAuth переход остаётся частью проверки после публикации.
- [x] Запустить MCP функцию, обнаружить пять инструментов и вызвать `record_receipt` с одной тестовой покупкой; увидеть тот же итог на сайте.
- [x] Повторить отправку с тем же `submission_id` и получить `replayed`; отправить тот же чек с новым ID и получить `duplicate_candidate`.
- [x] Исправить документ через `replace_receipt`, проверить обновлённую сумму на сайте, затем удалить тестовую запись через `delete_receipt` с `confirm: true`.
- [x] Выполнить полный набор тестов, lint базы, TypeScript и сборку.

## Результат локальной проверки

На 1 октября 2026 года локальная база, Edge Function, OAuth и MCP прошли проверку с прежним входом по ссылке из письма. После перехода на вход по паролю этот конкретный сценарий требует повторной проверки на опубликованном сайте. Запись, исправление и удаление чека, а также изоляция данных пользователей реализованы отдельно от способа входа.

Это локальная проверка. Путь «фото в конкретном аккаунте ChatGPT/Codex → подключение MCP → удалённый сайт» требует развёрнутых проектов и отдельного smoke test.

## Supabase

1. Создайте проект и убедитесь, что он подписывает пользовательские JWT асимметричным ключом ES256 или RS256: middleware MCP сверяет их с JWKS. Старый HS256 для этого сервера не подходит. [Требование Supabase MCP](https://supabase.com/docs/guides/ai-tools/byo-mcp).
2. В Authentication → URL Configuration установите **Site URL** в адрес production сайта Vercel, например `https://expenses.example.com`. Для входа по паролю Redirect URL `/auth/callback` не нужен; Site URL остаётся нужен для OAuth consent. [Настройка Supabase OAuth](https://supabase.com/docs/guides/auth/oauth-server/getting-started).
3. В Authentication → Sign In / Providers отключите **Allow new users to sign up** и оставьте вход через Email включённым. В Authentication → Users → Add user создайте каждого пользователя с email и паролем; подтвердите email при создании, если интерфейс предлагает такой переключатель. Не создавайте пользователей прямой вставкой в `auth.users`: используйте Dashboard или Auth Admin API. Это позволяет входить без SMTP. [Конфигурация Auth](https://supabase.com/docs/guides/auth/general-configuration), [Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser).
4. В Authentication → OAuth Server включите сервер OAuth 2.1, **Authorization Path** `/oauth/consent` и динамическую регистрацию клиентов. Экран согласия будет доступен на Site URL + этот путь. [Настройка Supabase OAuth](https://supabase.com/docs/guides/auth/oauth-server/getting-started).
5. Примените миграцию и опубликуйте функцию:

   ```bash
   pnpm supabase login
   pnpm supabase link --project-ref YOUR_PROJECT_REF
   pnpm supabase db push
   pnpm supabase functions deploy mcp --no-verify-jwt
   ```

   `--no-verify-jwt` отключает проверку JWT только на шлюзе функции. Middleware `withSupabase({ auth: 'user' })` проверяет OAuth токен внутри функции, а RLS ограничивает данные. Локальный `supabase/config.toml` содержит `site_url = "http://localhost:3000"`: **не отправляйте его в production через `config push` без замены Site URL и redirect URLs**.

   При обновлении категорий примените миграцию `20261002000000_expand_expense_categories.sql` до публикации новой версии функции. Затем обновите метаданные MCP подключения в ChatGPT Plugins через **Refresh**, чтобы клиент увидел расширенную схему `record_receipt`.

URL функции: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/mcp`. Проверяйте `GET` protected-resource metadata и `401` с `WWW-Authenticate` при вызове без токена. [Схема Supabase MCP](https://supabase.com/docs/guides/ai-tools/byo-mcp).

## Vercel

Импортируйте этот репозиторий как Next.js проект. Задайте переменные для Production:

| Имя | Значение |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key проекта Supabase |

После публикации сравните Site URL в Supabase и постоянный домен Vercel. Откройте `/login`, войдите заранее созданным пользователем и убедитесь, что открывается `/dashboard`. Для данного входа не нужны SMTP, шаблон письма и Redirect URL для `/auth/callback`.

## Подключение ChatGPT и Codex

URL удалённого MCP: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/mcp`. Он работает через Streamable HTTP и OAuth 2.1.

- **ChatGPT на телефоне:** один раз включите Developer mode в Settings → Security and login и добавьте MCP URL через ChatGPT Plugins. Проверьте обнаруженные инструменты, войдите через Supabase и разрешите доступ. Установите созданный личный плагин на тот же аккаунт, затем откройте новый чат на телефоне, выберите плагин из меню инструментов или через `@`, приложите фото чека и попросите записать покупки. Плагины доступны на мобильных устройствах, но автоматический вызов инструмента по одному фото в произвольном чате нужно проверять отдельно. [Подключение MCP](https://developers.openai.com/plugins/deploy/connect-chatgpt), [мобильные плагины](https://learn.chatgpt.com/docs/plugins), [выбор плагина](https://learn.chatgpt.com/docs/migrate-custom-gpts).
- **Codex CLI/IDE:** добавьте сервер командой `codex mcp add expenses --url https://YOUR_PROJECT_REF.supabase.co/functions/v1/mcp`, затем проверьте `codex mcp list` и пройдите OAuth вход, когда клиент его запросит. Конфигурация CLI и IDE общая. [Официальная документация Codex MCP](https://developers.openai.com/learn/docs-mcp).

OpenAI требует discovery, DCR или CIMD, PKCE и OAuth metadata для защищённого MCP. После добавления подключения проверьте не только список инструментов, но и реальный вход, вызов записи и показ результата на сайте. [Требования OpenAI к OAuth](https://developers.openai.com/plugins/build/auth).

## Smoke test после публикации

1. В новом чате с включённым подключением отправьте разборчивое фото тестового чека и попросите записать покупки. Проверьте, что модель вызвала `record_receipt` и ответила суммой и количеством позиций.
2. Откройте dashboard под тем же email. Проверьте сумму, дату и позиции. Запросите исправление через чат и убедитесь, что сайт обновился.
3. Повторите ту же запись и проверьте запрос подтверждения дубликата. Удалите только тестовый документ по явному запросу.
4. Если ChatGPT не предлагает вход, проверьте `WWW-Authenticate`, protected-resource metadata, OAuth discovery, схемы инструментов и точный redirect URI подключения. Для Inspector выберите Streamable HTTP и MCP URL. [Проверка MCP в OpenAI](https://developers.openai.com/plugins/deploy/connect-chatgpt).

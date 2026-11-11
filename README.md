# Maison Zhanele

Премиальный e-commerce каталог украшений на Next.js, Prisma и PostgreSQL. Клиентская часть поддерживает русский/казахский языки, мобильный интерфейс, корзину и передачу заказа в WhatsApp.

## Локальный запуск

1. Скопируйте `.env.example` в `.env` и заполните секретные значения.
2. Установите зависимости: `npm.cmd ci`.
3. Примените локальную схему: `npm.cmd run db:push`.
4. Заполните демо-данные: `npm.cmd run db:seed`.
5. Запустите приложение: `npm.cmd run dev`.

В PowerShell используйте `npm.cmd`, если политика выполнения блокирует `npm.ps1`.

Seed требует непустые `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD`. Пароль не имеет значения по умолчанию, не выводится в логах и не хранится в `.env.example`.

## Доступ к админке

Парольный обход `/admin` доступен только при одновременном выполнении всех условий:

- `NODE_ENV=development`;
- `ADMIN_LOCAL_BYPASS=true`;
- `NEXT_PUBLIC_APP_URL` указывает на `http://localhost:3000` или `http://127.0.0.1:3000`;
- запрос пришёл на `localhost` или `127.0.0.1`.

В production, preview, staging и на публичном IP обход не работает. Там `/admin` и `/api/admin/*` требуют Auth.js-сессию с ролью `ADMIN` или `MANAGER`.

## Переменные окружения

Шаблон находится в [.env.example](./.env.example). Не коммитьте `.env` и реальные ключи.

В production обязательно задайте `AUTH_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ADMIN_WHATSAPP` и оба `UPSTASH_REDIS_REST_*`. При отсутствии Redis в production критические rate-limited endpoints работают в fail-closed режиме и возвращают `429`; локальная разработка без Redis остаётся доступной.

## PostgreSQL, миграции и Docker

Для нового production-окружения:

```bash
docker compose up -d db
docker compose run --rm app npm run db:deploy
docker compose up -d app
```

`docker-compose.yml` получает пароль PostgreSQL из `POSTGRES_PASSWORD`, а контейнер приложения запускает только `npm run start`. Схема автоматически не изменяется при старте контейнера.

Для существующей локальной базы, созданной через `db:push`, используйте `npm.cmd run db:push`. Для новых окружений используйте `npm run db:deploy` и миграции из `prisma/migrations`.

## Проверки

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

Build использует безопасный placeholder `DATABASE_URL` только при генерации Prisma/Next в CI. Для runtime настоящая база всё равно обязательна.

## Безопасность

- Все запросы к базе выполняются через Prisma ORM.
- Вход, поиск, заказ, gift hint и административные операции ограничены rate limit.
- В production отсутствие Upstash Redis блокирует критические запросы, а не отключает защиту.
- Загрузки принимают только JPG, PNG, GIF и WebP, проверяют сигнатуру файла, размер и генерируют UUID-имя. SVG запрещён.
- Валидация входных данных выполняется через Zod.
- Промокоды списываются атомарно; `maxUses` нельзя превысить параллельными заказами.
- Цена и остаток заказа берутся из базы; списание остатков происходит в транзакции.
- Заказы и gift hint не имеют публичного endpoint просмотра.

## Где менять код

- Главная: `src/app/page.tsx`.
- Каталог: `src/app/catalog/page.tsx`.
- Русский/казахский текст: `src/lib/i18n-messages.ts`.
- Шапка: `src/components/site-header.tsx`.
- Корзина и WhatsApp: `src/components/cart-drawer.tsx`, `src/app/checkout/page.tsx`, `src/lib/whatsapp.ts`.
- Админские товары и категории: `src/app/admin/products/product-manager.tsx`.
- Prisma-схема: `prisma/schema.prisma`.
- Seed: `prisma/seed.ts`.

## Git и секреты

`.env`, ключи, сертификаты, логи, backup-файлы и локальные базы включены в `.gitignore`. История Git не переписывалась. Старые коммиты могут содержать небезопасные значения по умолчанию — если они использовались где-либо кроме локальной разработки, замените соответствующие PostgreSQL и seed-пароли.

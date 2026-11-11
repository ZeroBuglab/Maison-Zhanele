# Maison Zhanele

Премиальный e-commerce каталог украшений с русским и казахским языками, мобильной версией и заказом через WhatsApp.

## Быстрый запуск

1. В `.env` укажите PostgreSQL и секрет Auth.js.
2. Установите зависимости: `npm.cmd install`.
3. Обновите схему: `npm.cmd run db:push`.
4. При необходимости наполните демо-данными: `npm.cmd run db:seed`.
5. Запустите сайт: `npm.cmd run dev`.

Проверка: `http://localhost:3000`, здоровье базы: `http://localhost:3000/api/health`.

В PowerShell используется `npm.cmd`, потому что политика Windows может блокировать `npm.ps1`.

## Настройки магазина

```env
NEXT_PUBLIC_ADMIN_WHATSAPP="YOUR NUMBER"
NEXT_PUBLIC_INSTAGRAM_URL="YOUR INSTAGRAM"
```

Заказ из корзины открывает WhatsApp сразу с номером `+7 775 833 02 23` и выбранными товарами. Покупатель не заполняет аккаунт или платёжную форму.

`/account` удалён. В локальной разработке `/admin` открыт без логина; в production админка защищена Auth.js и ролями `ADMIN`/`MANAGER`.

## Где менять тексты и функции

- Шапка и пункты меню: `src/components/site-header.tsx`.
- Русский/казахский текст: `src/lib/i18n-messages.ts`.
- Переключатель языка: `src/components/language-switcher.tsx`.
- Главная страница: `src/app/page.tsx`.
- Каталог: `src/app/catalog/page.tsx`.
- Онлайн-магазин Алматы: `src/app/stores/page.tsx`.
- Корзина и заказ: `src/components/cart-drawer.tsx`, `src/app/checkout/page.tsx`, `src/lib/whatsapp.ts`.
- Цвета и адаптивность: `src/app/globals.css`.

## Ассортимент

`/admin/products` позволяет добавлять и редактировать товары, загружать изображения, менять цены и остатки. Внутренний SKU создаётся автоматически — вводить код товара не нужно.

В блоке «Категории каталога» можно добавлять категории и скрывать ненужные. Скрытая категория и её товары исчезают из клиентского каталога, но остаются доступными в админке.

## Docker

`docker-compose.yml` запускает PostgreSQL на порту `5433` и приложение на `3000`:

```bash
docker compose up --build
```

Остановить: `docker compose down`.

## Структура

```text
prisma/schema.prisma       # каталог, варианты, заказы и роли
prisma/seed.ts              # демо-данные
src/lib/                    # Prisma, валидация, i18n, WhatsApp, rate limit
src/store/cart.ts           # корзина Zustand
src/app/api/                # API товаров, категорий, gift hint и заказов
src/app/admin/              # dashboard, товары, скидки
src/app/catalog/            # каталог и фильтры
src/app/product/[slug]/     # карточка товара и намёк на подарок
src/app/checkout/           # переход в WhatsApp
src/components/             # header, карточки, корзина, размеры
```

# Maison Zhanele

A premium e-commerce catalog for jewelry, built with Next.js, Prisma, and PostgreSQL. The client-side interface supports Russian and Kazakh, features a mobile-responsive design, a shopping cart, and an option to send orders via WhatsApp.

## Local Setup

1. Copy `.env.example` to `.env` and fill in the required secret values.
2. Install dependencies: `npm.cmd ci`.
3. Apply the local schema: `npm.cmd run db:push`.
4. Seed the database with demo data: `npm.cmd run db:seed`.
5. Start the application: `npm.cmd run dev`.

If you are using PowerShell and the execution policy blocks `npm.ps1`, please use `npm.cmd` instead.

The seeding process requires non-empty values ​​for `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`. The password has no default value; it is not logged anywhere and is not included in `.env.example`.

## Accessing the Admin Panel

To create the first administrator in the deployed database, set these variables in the deployment environment:

```env
SEED_ADMIN_EMAIL=your-admin-email@example.com
SEED_ADMIN_PASSWORD=use-a-new-password-with-at-least-12-characters
```

Then apply the schema and run the seed against the same production `DATABASE_URL`:

```bash
npm run db:deploy
npm run db:seed
```

Open `https://your-domain.example/admin` and enter the email and password configured above. The application does not display these credentials, and the seed command never prints the password. If the production database was already seeded, run the seed again after changing these variables to update the administrator password.

Bypassing the password requirement for the `/admin` route is only possible when all of the following conditions are met:

- `NODE_ENV=development`;
- `ADMIN_LOCAL_BYPASS=true`;
- `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000` or `http://127.0.0.1:3000`;
- The request originates from `localhost` or `127.0.0.1`.

This bypass does not work in production, preview, or staging environments, nor when accessed via a public IP address. In those cases, the `/admin` and `/api/admin/*` routes require an active Auth.js session with an `ADMIN` or `MANAGER` role.

## Environment Variables

A template is provided in [.env.example](./.env.example). Please do not commit the `.env` file or any actual secret keys to version control. In a production environment, you must set `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_ADMIN_WHATSAPP`, and both `UPSTASH_REDIS_REST_*` variables. `AUTH_URL` and `NEXT_PUBLIC_APP_URL` must contain the complete public `https://` URL without a trailing slash. If Redis is unavailable in production, critical rate-limited endpoints will default to a "fail-closed" state and return a `429` status code; however, local development remains possible without Redis.

For Vercel deployments, create or connect a Vercel Blob store and add `BLOB_READ_WRITE_TOKEN` to the Production and Preview environments. Product images are stored in Blob; they are not written to `public/uploads` because the Vercel filesystem is read-only at runtime.

## PostgreSQL, Migrations, and Docker

For a new production environment:

```bash
docker compose up -d db
docker compose run --rm app npm run db:deploy
docker compose run --rm --env-from-file .env app npm run db:seed
docker compose up -d app
```

The `docker-compose.yml` file retrieves the PostgreSQL password from the `POSTGRES_PASSWORD` variable, and the application container executes only `npm run start`. The database schema is not automatically updated when the container starts.

For an existing local database created via `db:push`, use `npm.cmd run db:push`. For new environments, use `npm run db:deploy` along with the migrations located in `prisma/migrations`.

## Checks

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

During the build process, a placeholder `DATABASE_URL` is used solely for Prisma/Next generation within the CI pipeline. A valid, functional database is still required for runtime.

## Security

- All database queries are performed via the Prisma ORM.
- Login, search, ordering, gift hints, and administrative operations are subject to rate limiting.
- In production, the absence of Upstash Redis results in the blocking of critical requests rather than the disabling of security protections.
- File uploads are restricted to JPG, PNG, GIF, and WebP formats; the system verifies file signatures and sizes, and assigns a UUID-based filename. SVG files are prohibited.
- Input data is validated using Zod.
- Promo code usage is handled atomically, ensuring that the `maxUses` limit cannot be exceeded through concurrent orders. - Order prices and remaining stock levels are retrieved from the database; stock deductions are processed within a transaction.
- There are no public endpoints for viewing orders or "gift hints."

## Where to modify the code

- Home page: `src/app/page.tsx`.
- Catalog: `src/app/catalog/page.tsx`.
- Russian/Kazakh text: `src/lib/i18n-messages.ts`.
- Header: `src/components/site-header.tsx`.
- Cart and WhatsApp: `src/components/cart-drawer.tsx`, `src/app/checkout/page.tsx`, `src/lib/whatsapp.ts`.
- Admin products and categories: `src/app/admin/products/product-manager.tsx`.
- Prisma schema: `prisma/schema.prisma`.
- Seed script: `prisma/seed.ts`.

## Git and secrets

Files such as `.env`, keys, certificates, logs, backups, and local databases are included in `.gitignore`. The Git history has not been rewritten. Older commits may contain insecure default values—if these were ever used outside of a local development environment, please update the corresponding PostgreSQL and seed passwords.

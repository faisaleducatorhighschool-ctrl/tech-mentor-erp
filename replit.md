# Faisal Book Depot ERP

Full-stack ERP system for Faisal Book Depot, Khanpur. Two client apps share one backend API and PostgreSQL database.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — MySQL connection string (`mysql://user:pass@host:3306/dbname`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080, path `/api`)
- DB: MySQL + Drizzle ORM (mysql2 driver, 23 tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (ESM bundle → `dist/index.mjs`)
- Customer web app: React + Vite (`/customer-app/`)
- Customer Android app: Expo (`/artifacts/customer-mobile/`) — EAS builds only, not a Replit workflow
- Staff app: Expo React Native (`/employee-app/`)

## Where things live

- `lib/db/src/schema/` — all 23 Drizzle ORM table schemas (source of truth)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-zod/src/generated/` — generated Zod schemas (do not edit)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `artifacts/api-server/src/routes/` — all 28 Express route handlers
- `artifacts/customer-app/src/` — React/Vite customer web storefront
- `artifacts/customer-mobile/app/` — Expo customer Android app (EAS builds)
- `artifacts/employee-app/app/` — Expo staff ERP app
- `docs/deployment-guide.md` — full EAS build + Play Store guide
- `docs/play-store-assets.md` — store listing copy, descriptions, privacy policy

## Architecture decisions

- Database is MySQL (mysql2 driver). All raw SQL in drizzle `sql\`...\`` must use MySQL syntax: `CAST(x AS DATE)` not `x::date`, no `::numeric`/`::bigint` casts (decimal columns are already numeric), `REGEXP` not `~`, `INTERVAL N DAY` not `INTERVAL 'N days'`, `DATE_FORMAT(...)` not `to_char`/`date_trunc`, backtick (or unquoted) identifiers not double-quotes. `CURRENT_DATE`, `NOW()`, `coalesce`, `substring`, `GREATEST` work in both.
- MySQL has no `RETURNING`: inserts use Drizzle `.$returningId()` (returns `[{ id }]`) then re-select the row. `db.execute(sql\`SELECT...\`)` returns `[rows, fields]` — read rows via index `[0]` (the route helpers handle both this and pg's `.rows`).
- Upserts use `.onDuplicateKeyUpdate({ set })`; no-op (insert-ignore) upserts use `set: { id: sql\`id\` }`.
- The shared proxy routes `/api` → API server, `/customer-app` → web app. No Vite proxy config needed.
- JWT auth: staff tokens via `/api/auth/login`, customer tokens via `/api/store/auth/login`.
- `SESSION_SECRET` env var is used as the JWT signing key.

## Product

**Customer Web App** (`/customer-app/`) — Public web storefront, live in browser.
  - Browse products, categories, brands
  - Cart, checkout (guest + registered)
  - Customer login/register, order history, wishlist, profile

**Customer Android App** (`artifacts/customer-mobile/`) — Expo app, built with EAS CLI.
  - All same features as web app, native Android UX
  - Home, Shop, Cart, Profile tabs; product detail, checkout, orders, wishlist
  - Guest checkout, customer login/register, cart persisted in AsyncStorage
  - Payment: COD, JazzCash, EasyPaisa, Bank Transfer
  - App name: "Faisal Book Depot Khanpur" | Package: `com.faisalbookdepot.khanpur`

**Staff App** (`/employee-app/`) — Internal Expo ERP for staff/admin.
  - Dashboard, POS, Sales, Purchases, Inventory, Products
  - Customers, Suppliers, Ledger, Reports, Expenses
  - Role-based access, requires staff login
  - App name: "Faisal Book Depot Staff" | Package: `com.faisalbookdepot.staff`

## Default credentials

- Admin login: username `admin`, password `admin123`

## User preferences

- Currency: PKR (Pakistani Rupee)
- Store location: Khanpur, Pakistan
- White-label: store name, branding, and contact info are all driven from the `settings` table in the database — no code changes needed for rebranding.

## Gotchas

- After any schema change run `pnpm --filter @workspace/db run push` (needs a live MySQL `DATABASE_URL`) then `pnpm --filter @workspace/api-spec run codegen`. On Hostinger you can instead import the provided SQL dump directly.
- MySQL not PostgreSQL: write all raw `sql\`...\`` fragments in MySQL syntax (see Architecture decisions above).
- Production entry file is `artifacts/api-server/dist/index.mjs` (ESM bundle), not `dist/index.js`. Set this as the Hostinger Node entry point.
- `pnpm run dev` at root does not exist by design. Start individual services via workflows.
- Employee-app uses Expo Go; run via `restart_workflow "artifacts/employee-app: expo"`.
- Customer-mobile is NOT a Replit workflow artifact (only one mobile slot available); build via `cd artifacts/customer-mobile && eas build --platform android --profile preview`.
- Before building customer-mobile, set `EXPO_PUBLIC_DOMAIN` in `artifacts/customer-mobile/eas.json` to your live domain.
- Orval-generated hooks wrap `UseQueryOptions` — pass `{ query: { enabled } as any }` for conditional queries.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

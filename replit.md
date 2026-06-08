# Faisal Book Depot ERP

Full-stack ERP system for Faisal Book Depot, Khanpur. Two client apps share one backend API and PostgreSQL database.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080, path `/api`)
- DB: PostgreSQL + Drizzle ORM (23 tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)
- Customer app: React + Vite (`/customer-app/`)
- Staff app: Expo React Native (`/employee-app/`)

## Where things live

- `lib/db/src/schema/` — all 23 Drizzle ORM table schemas (source of truth)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-zod/src/generated/` — generated Zod schemas (do not edit)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `artifacts/api-server/src/routes/` — all 28 Express route handlers
- `artifacts/customer-app/src/` — React/Vite customer storefront
- `artifacts/employee-app/app/` — Expo staff ERP app

## Architecture decisions

- Originally MySQL; migrated to PostgreSQL — use `::bigint` not `CAST(x AS UNSIGNED)`, `CURRENT_DATE` not `CURDATE()`, `~` for regex not `REGEXP`.
- All raw SQL fragments in drizzle `sql\`...\`` must use PostgreSQL syntax.
- The shared proxy routes `/api` → API server, `/customer-app` → web app. No Vite proxy config needed.
- JWT auth: staff tokens via `/api/auth/login`, customer tokens via `/api/store/auth/login`.
- `SESSION_SECRET` env var is used as the JWT signing key.

## Product

**Customer App** (`/customer-app/`) — Public storefront for Faisal Book Depot Khanpur.
  - Browse products, categories, brands
  - Cart, checkout (guest + registered)
  - Customer login/register, order history, wishlist, profile
  - App name: "Faisal Book Depot Khanpur" | Package: com.faisalbookdepot.khanpur

**Staff App** (`/employee-app/`) — Internal ERP for staff/admin.
  - Dashboard, POS, Sales, Purchases, Inventory, Products
  - Customers, Suppliers, Ledger, Reports, Expenses
  - Role-based access, requires staff login
  - App name: "Faisal Book Depot Staff" | Package: com.faisalbookdepot.staff

## Default credentials

- Admin login: username `admin`, password `admin123`

## User preferences

- Currency: PKR (Pakistani Rupee)
- Store location: Khanpur, Pakistan
- White-label: store name, branding, and contact info are all driven from the `settings` table in the database — no code changes needed for rebranding.

## Gotchas

- After any schema change run `pnpm --filter @workspace/db run push` then `pnpm --filter @workspace/api-spec run codegen`.
- PostgreSQL not MySQL: no `CAST(x AS UNSIGNED)` — use `x::bigint`. No `CURDATE()` — use `CURRENT_DATE`. No backtick identifiers.
- `pnpm run dev` at root does not exist by design. Start individual services via workflows.
- Employee-app uses Expo Go; run via `restart_workflow "artifacts/employee-app: expo"`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

---
name: mysql2 external in esbuild server bundle
description: Why the API server bundle fails at runtime with ERR_MODULE_NOT_FOUND for mysql2 even though typecheck and build pass.
---

# mysql2 must be a direct dependency of the server artifact

The api-server esbuild config (`artifacts/api-server/build.mjs`) lists `mysql2` in its
`external` array (alongside other packages with dynamic/native requires). Externalized
packages are NOT bundled into `dist/index.mjs`; Node resolves them from `node_modules`
at runtime.

**Rule:** any DB driver that is esbuild-external (e.g. `mysql2`) must be declared in the
**api-server** package's `dependencies` — not only in `lib/db`. The driver is imported
transitively via `lib/db`, but because the bundle runs from `artifacts/api-server/dist`,
pnpm only guarantees resolution if api-server declares it directly.

**Why:** `pg` worked without this because `pg` is NOT in the external list, so esbuild
bundled it. `mysql2` IS external, so dropping it from api-server deps produces a runtime
`ERR_MODULE_NOT_FOUND: Cannot find package 'mysql2'` — invisible to typecheck and to the
esbuild build step (both pass). Only a real boot catches it.

**How to apply:** when swapping the DB driver, check `build.mjs` `external`. If the new
driver is listed there, add it to `artifacts/api-server/package.json` dependencies and
`pnpm install`. Then restart the workflow to confirm the bundle boots.

---
name: Staff ERP served as web app from api-server
description: How the employee-app (Expo) is served as a browser web ERP from the Express api-server on one domain.
---

# Staff ERP web app = Expo web export served by api-server

The staff ERP (`artifacts/employee-app`, an Expo Router app) is served as a **browser web app from the api-server**, so one Hostinger domain hosts both the API (`/api`) and the ERP UI (`/`).

**How it works:**
- `expo export --platform web` (run in `artifacts/employee-app`) produces a static SPA in `dist/`.
- That output is copied (committed) to `artifacts/api-server/web-erp/`.
- `api-server/build.mjs` copies `web-erp/` → `dist/web-erp` during the esbuild build.
- `api-server/src/app.ts` serves it: `/api` router first, then `/api` JSON 404, then `express.static(web-erp)` + a GET/HEAD-only SPA fallback to `index.html` (resolved via `import.meta.url` → `dist/web-erp`).
- `employee-app/app/_layout.tsx`: on web `setBaseUrl("")` (same-origin relative `/api`); on native `setBaseUrl(\`https://${EXPO_PUBLIC_DOMAIN}\`)`.

**Why:** single deployment, single domain, no CORS, no separate web host. The phone app and web app share the exact same code and backend.

**How to apply / gotchas:**
- The committed `artifacts/api-server/web-erp/` bundle is a build artifact — after ANY change to `employee-app`, re-run the web export and re-copy into `web-erp`, or the web ERP serves STALE code. (No CI step regenerates it yet.)
- `expo export --platform web` takes ~2–4 min and exceeds a single tool-call window; backgrounded processes are killed at tool boundaries here, so run it foreground (first run warms Metro cache, a second run finishes faster).
- Live domain: `plum-swallow-901405.hostingersite.com`. Phone app domain is set in `employee-app/eas.json` (preview + production `EXPO_PUBLIC_DOMAIN`).

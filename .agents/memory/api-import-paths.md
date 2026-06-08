---
name: API import paths
description: Convention for .js extension imports in the api-server ESM build
---

## Import path convention
All imports inside `artifacts/api-server/src/` must use `.js` extensions (not `.ts`):
- Route files: `import fooRouter from "./foo.js"`
- Lib files: `import { fn } from "../lib/auth.js"`
- app.ts: `import router from "./routes/index.js"`

**Why:** The api-server builds to ESM via esbuild. Node.js ESM requires explicit file extensions. TypeScript resolves `.ts` → `.js` at runtime.

**How to apply:** Always add `.js` when writing new imports in api-server route or lib files.

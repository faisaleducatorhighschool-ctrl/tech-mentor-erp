---
name: pino worker files break on constrained hosts
description: Why the api-server logger must be plain pino (no transport) in the production esbuild bundle.
---

# pino transport workers crash on shared hosting (Hostinger)

The api-server logger must be **plain pino logging JSON to stdout** — no `transport` block, and the esbuild bundle must NOT use `esbuild-plugin-pino`.

**Why:** `esbuild-plugin-pino` emits sibling worker files (`pino-pretty.mjs`, `pino-worker.mjs`, `thread-stream-worker.mjs`, `pino-file.mjs`) next to `dist/index.mjs`, and pino resolves them by filesystem path at runtime. On constrained hosts like Hostinger (Git "Deploy from GitHub" → Node app), that path resolution fails and the process crashes at boot with `ENOENT: no such file or directory, stat '.../...'`. This masked the real cause for many deploy cycles because the ENOENT looks like a missing entry file, not a logging problem.

**How to apply:** Keep `logger.ts` as a bare `pino({ level, redact })` with no `transport`. Keep `build.mjs` with no `esbuild-plugin-pino` plugin so `dist/` contains only `index.mjs` (+ map). For human-readable dev logs, pipe stdout through the `pino-pretty` CLI instead of using the in-process transport (do not pipe inside a Replit workflow command — it interferes with process/port management; JSON logs in dev are fine).

# Memory Index

- [mysql2 esbuild bundle](mysql2-esbuild-bundle.md) — mysql2 is esbuild-external, so the api-server package (not just lib/db) must declare it or the bundle fails at runtime with ERR_MODULE_NOT_FOUND.
- [pino worker bundle](pino-worker-bundle.md) — logger must be plain pino (no transport) + no esbuild-plugin-pino, or pino worker files cause ENOENT-at-boot on constrained hosts (Hostinger).

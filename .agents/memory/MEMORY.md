# Memory Index

- [mysql2 esbuild bundle](mysql2-esbuild-bundle.md) — mysql2 is esbuild-external, so the api-server package (not just lib/db) must declare it or the bundle fails at runtime with ERR_MODULE_NOT_FOUND.
- [Staff ERP web serving](web-erp-serving.md) — employee-app Expo web export is committed to api-server/web-erp and served same-origin; re-export after any employee-app change or web ERP goes stale.
- [Hostinger GitHub deploy](hostinger-github-deploy.md) — manual file-by-file GitHub sync diverges & causes phantom errors; push the whole tree via the GitHub connector token (git push from code_execution). API-only: `/`=Cannot GET, `/api/healthz`=liveness.
- [pino worker bundle](pino-worker-bundle.md) — logger must be plain pino (no transport) + no esbuild-plugin-pino, or pino worker files cause ENOENT-at-boot on constrained hosts (Hostinger).

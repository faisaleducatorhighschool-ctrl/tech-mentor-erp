---
name: Hostinger GitHub deploy
description: Lessons from deploying this API-only backend to Hostinger via "Deploy from GitHub", incl. GitHub-repo divergence and how to push wholesale.
---

# Deploying to Hostinger via GitHub

## Manual file-by-file GitHub sync causes phantom errors
When the deployment GitHub repo is updated by hand (web UI, one file at a time)
instead of pushing the whole tree, it silently **diverges** from the tested
source. Symptom seen here: the deployed server crashed on a path
(`artifacts/smart-retail-erp/dist/public/index.html`) that **does not exist in
the real source at all** — it came from an older architecture still living in
the GitHub repo. We chased several unrelated "fixes" (pino worker files, entry
path) before realizing the deployed code simply wasn't our code.

**Rule:** if deployed behavior references files/folders that don't exist in the
current source, suspect repo divergence first. Don't keep patching individual
files onto a stale repo — sync the entire tree.

## Pushing the whole project when the Git-pane GitHub button is unavailable
The native "Connect to GitHub" in Replit's Git pane can be unavailable
("Integration Unavailable"). Fallback that worked: add the **GitHub connector**
via the integrations system (`searchIntegrations`/`addIntegration`/
`proposeIntegration`), then in `code_execution` read the OAuth token with
`listConnections("github")` (`settings.access_token`) and drive `git` through
`node:child_process`:
- create the repo via `POST /user/repos`
- `git push <https://login:token@github.com/owner/repo.git> HEAD:refs/heads/main`
- to overwrite a divergent existing repo, `git push --force` (get user consent first).
Always redact the token from any captured git output before logging it.

**Why:** the connector token carries `repo` scope, so it works for git over
HTTPS even when the Git-pane integration is down. This is the reliable way to
make GitHub match the tested Replit tree in one shot.

## What "working" looks like for this API-only server
There is no web frontend in the API server. On the live domain:
- `/` → `Cannot GET /` (Express default 404) — **this is correct**, not a bug.
- `/api/healthz` → `{"status":"ok"}` — this is the real liveness check; it does
  NOT touch the DB (pool is lazy), so a 200 here only proves the process runs.
- DB-backed routes (e.g. `/api/store/settings`) returning 500 while healthz is
  200 means the process is up but **MySQL is unreachable or unpopulated**
  (wrong db name/creds in `DATABASE_URL`, or the SQL dump/tables not imported).

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

## Hostinger MySQL: use 127.0.0.1, never localhost; keep password alphanumeric
Two distinct auth failures stacked here, both surfaced by Drizzle as a generic
`Failed query: select ...` with the real cause truncated:
1. **Wrong password** — `ER_ACCESS_DENIED_ERROR` (errno 1045) "using password: YES"
   on *every* connection method. The `@` in the password (`F@isal6874`) survived
   as a stray encoding char (parsed password length was 11, not 10), so the login
   never matched. Fix: reset the DB user password to **letters+numbers only** to
   sidestep all URL-encoding of `DATABASE_URL`.
2. **IPv6 localhost** — once the password was right, `127.0.0.1` and the unix
   socket `/tmp/mysql.sock` connected fine, but `localhost` still failed because
   Node resolves `localhost` → IPv6 `::1`, and the Hostinger DB user is granted
   for `127.0.0.1`/socket, **not** `::1`. Fix: set host to `127.0.0.1` in
   `DATABASE_URL` (`mysql://user:pass@127.0.0.1:3306/db`).

**Why:** Hostinger's real DB name *and* user are both the panel value prefixed
with the account id (e.g. `u658282486_` → `u658282486_u658282_fbd`). Grants are
tied to `127.0.0.1`, and `localhost`≠`127.0.0.1`≠`::1` in MySQL's host matching.

**How to debug fast:** a temporary `/api/diag/db` route that uses `mysql2/promise`
`createConnection` to probe `127.0.0.1`, `::1`, `localhost`, and common socket
paths in one request returns the *exact* `code`/`errno`/`message` per target as
JSON — ends the guessing from truncated log screenshots. Remove it after. Make
the diag also echo the *parsed* creds (user, host, db, passwordLength — never the
password value): that is what exposed the all-caps bug below in one read.

## All-caps DATABASE_URL silently breaks parsing
A non-technical user typed the whole `DATABASE_URL` value in CAPITAL letters
(`MYSQL://U658282486_FBDLIVE:...`). Symptoms via diag: parsed user came out as
literal `MYSQL`, database uppercased, passwordLength wildly wrong (42), and every
connection `ER_ACCESS_DENIED`. Causes: (1) the `mysql://` strip regex is
case-sensitive so `MYSQL://` isn't removed and the first `:` (in `MYSQL:`) is
taken as the user/password split; (2) MySQL usernames and Linux db names are
case-sensitive so `U658282486_...` ≠ the real lowercase identifiers.
**Fix:** have the user *paste* (not type) the exact-case value; the only caps
should be inside the password. **Why it recurs:** mobile/keyboard auto-capitalize
and Caps Lock. The parser's protocol strip could be made `/i`, but that still
won't rescue uppercased credentials — correct-case entry is the real fix.

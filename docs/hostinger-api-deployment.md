# Faisal Book Depot — Running the API Server on Hostinger (MySQL)

This guide is for the **backend API server** only. The web and mobile apps just talk to
this API over HTTPS.

> **The file you run:** `artifacts/api-server/dist/index.mjs`
> **The command:** `node artifacts/api-server/dist/index.mjs`
> You must build it first (Step 4) and have `node_modules` installed (Step 3).

Use a Hostinger plan with **SSH access** (VPS, or Premium/Business shared hosting with
the Node.js selector). The build uses `pnpm` + `esbuild`, so you need a terminal.

---

## STEP 1 — Create the MySQL database

In hPanel → **Databases → MySQL Databases**:

1. Create a database, a database user, and give the user all privileges on it.
2. Note these four values — you'll need them for `DATABASE_URL`:
   - host (often `localhost` or `127.0.0.1`)
   - port (usually `3306`)
   - database name
   - username + password
3. Open **phpMyAdmin** for that database and **Import** your SQL dump
   (the `.sql` file with all the tables). This creates all 23 tables.

---

## STEP 2 — Get the code onto the server

Either:

- **GitHub import / clone:** `git clone <your-repo-url>` into your app folder, **or**
- Upload the project ZIP via File Manager and extract it.

You want the **whole project** (the monorepo), not just one folder.

---

## STEP 3 — Install Node + pnpm, then dependencies

In SSH, from the project root (where `pnpm-workspace.yaml` is):

```bash
# Use Node 20 or newer (hPanel "Node.js" selector, or nvm on a VPS)
node -v          # should print v20.x or newer

# Enable pnpm (one of these)
corepack enable && corepack prepare pnpm@latest --activate
# ...or: npm install -g pnpm

# Install ALL workspace dependencies (this is what makes mysql2 resolvable)
pnpm install
```

---

## STEP 4 — Build the API server

```bash
pnpm --filter @workspace/api-server run build
```

This produces the file you run: **`artifacts/api-server/dist/index.mjs`**.

---

## STEP 5 — Set environment variables

The server reads these at startup. `PORT` and `DATABASE_URL` are **mandatory** — the
server exits immediately if either is missing.

| Variable        | Example value                                              | Notes |
|-----------------|-----------------------------------------------------------|-------|
| `DATABASE_URL`  | `mysql://dbuser:dbpass@localhost:3306/dbname`             | MySQL, **not** postgres. URL-encode special chars in the password. |
| `SESSION_SECRET`| a long random string                                      | JWT signing key. Keep it secret. |
| `NODE_ENV`      | `production`                                               | |
| `PORT`          | `8080` (or whatever Hostinger assigns)                    | Required. On the Node.js selector, Hostinger sets this for you. |

On a VPS you can put them in a `.env`-style export or pass them inline (Step 6).
On the hPanel Node.js selector, add them in the **Environment variables** section of the app.

---

## STEP 6 — Start the server

**Quick test (foreground):**

```bash
DATABASE_URL="mysql://dbuser:dbpass@localhost:3306/dbname" \
SESSION_SECRET="your-long-random-secret" \
NODE_ENV=production \
PORT=8080 \
node artifacts/api-server/dist/index.mjs
```

You should see `Server listening` with the port. Press Ctrl+C to stop.

**Keep it running (VPS — recommended) with PM2:**

```bash
npm install -g pm2
pm2 start artifacts/api-server/dist/index.mjs --name fbd-api \
  --update-env
pm2 save
pm2 startup     # follow the printed command so it survives reboots
```

(Set the env vars in your shell or an `ecosystem.config.js` before `pm2 start`.)

**hPanel Node.js selector:** set
- **Application root** → the project folder
- **Application startup file** → `artifacts/api-server/dist/index.mjs`
- add the env vars from Step 5, then **Restart**.

---

## STEP 7 — Verify

```bash
curl http://localhost:8080/api/healthz      # -> 200
curl http://localhost:8080/api/store/settings   # -> JSON from your MySQL DB
```

Then point your domain to the app and confirm `https://yourdomain.com/api/healthz`
returns 200. Update the apps' API domain to match.

---

## Updating later

```bash
git pull                                          # get new code
pnpm install                                      # if deps changed
pnpm --filter @workspace/api-server run build      # rebuild dist/index.mjs
pm2 restart fbd-api                                # or Restart in hPanel
```

---

## Notes

- **Default admin login:** username `admin`, password `admin123` (change it after first login).
- **Why `pnpm install` is required on the server:** `mysql2` and `@google-cloud/storage`
  are intentionally kept *out* of the bundle, so Node loads them from `node_modules` at
  runtime. Uploading only `dist/` will fail with `Cannot find package 'mysql2'`.
- **Image uploads (object storage)** are optional and need Google Cloud credentials; the
  server runs fine without them, those upload features just won't work.
- **Rebranding** is done entirely in the `settings` table (store name, phone, logo, bank
  details) — no code change needed.

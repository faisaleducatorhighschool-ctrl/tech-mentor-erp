import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import mysql from "mysql2/promise";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

function parseDbUrl(raw: string) {
  const noProto = raw.replace(/^mysql:\/\//, "");
  const at = noProto.lastIndexOf("@");
  const creds = noProto.slice(0, at);
  const hostpart = noProto.slice(at + 1);
  const colon = creds.indexOf(":");
  const user = decodeURIComponent(creds.slice(0, colon));
  const password = decodeURIComponent(creds.slice(colon + 1));
  const slash = hostpart.indexOf("/");
  const hostPort = slash === -1 ? hostpart : hostpart.slice(0, slash);
  const database = slash === -1 ? "" : hostpart.slice(slash + 1);
  const [host, port] = hostPort.split(":");
  return { user, password, host, port: port ? Number(port) : 3306, database };
}

router.get("/diag/db", async (_req, res) => {
  const out: Record<string, unknown> = {};
  const raw = process.env.DATABASE_URL ?? "";
  let creds: ReturnType<typeof parseDbUrl> | null = null;
  try {
    creds = parseDbUrl(raw);
    out.parsed = {
      user: creds.user,
      host: creds.host,
      port: creds.port,
      database: creds.database,
      passwordLength: creds.password.length,
    };
  } catch (e) {
    out.parseError = (e as Error).message;
  }

  if (creds) {
    const targets: Array<{ name: string; opts: mysql.ConnectionOptions }> = [
      { name: "host:127.0.0.1", opts: { host: "127.0.0.1", port: creds.port } },
      { name: "host:::1", opts: { host: "::1", port: creds.port } },
      { name: "host:localhost", opts: { host: "localhost", port: creds.port } },
      { name: "socket:/var/run/mysqld/mysqld.sock", opts: { socketPath: "/var/run/mysqld/mysqld.sock" } },
      { name: "socket:/run/mysqld/mysqld.sock", opts: { socketPath: "/run/mysqld/mysqld.sock" } },
      { name: "socket:/tmp/mysql.sock", opts: { socketPath: "/tmp/mysql.sock" } },
    ];
    const results: Record<string, unknown> = {};
    for (const t of targets) {
      try {
        const conn = await mysql.createConnection({
          user: creds.user,
          password: creds.password,
          database: creds.database,
          connectTimeout: 5000,
          ...t.opts,
        });
        const [rows] = await conn.query("SELECT 1 AS ok");
        await conn.end();
        results[t.name] = { ok: true, rows };
      } catch (e) {
        const err = e as { message?: string; code?: string; errno?: number };
        results[t.name] = { ok: false, code: err.code, errno: err.errno, message: err.message };
      }
    }
    out.targets = results;
  }

  res.json(out);
});

export default router;

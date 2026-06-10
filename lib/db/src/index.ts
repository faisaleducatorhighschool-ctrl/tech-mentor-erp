import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function buildPoolConfig(raw: string): mysql.PoolOptions {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid URL. Expected: mysql://user:password@host:port/database",
    );
  }

  // Scheme is case-insensitive per the URL spec (url.protocol is lowercased),
  // so an all-caps "MYSQL://" is accepted here. A wrong scheme is a hard error
  // in production (fail fast on misconfig), but only a warning in development,
  // where the Replit-provided DATABASE_URL is Postgres and the MySQL pool is
  // simply never reachable (it stays lazy and unused).
  if (url.protocol !== "mysql:") {
    const msg = `DATABASE_URL must use the mysql:// scheme (got "${url.protocol}").`;
    if (process.env.NODE_ENV === "production") throw new Error(msg);
    console.warn(`[db] ${msg} Database queries will fail until it points to MySQL.`);
  }

  // url.username/password are percent-encoded; decode so special chars
  // (@ : / etc.) in credentials are passed to MySQL verbatim.
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));

  if (!user) throw new Error("DATABASE_URL is missing a username.");
  if (!database) throw new Error("DATABASE_URL is missing a database name.");

  // For the non-special mysql: scheme, IPv6 hosts keep their surrounding
  // brackets (e.g. "[::1]"); strip them since mysql2 wants a bare address.
  const hostname = url.hostname.replace(/^\[(.+)\]$/, "$1");
  // Force IPv4 loopback: Node resolves "localhost" to IPv6 (::1), which many
  // managed MySQL hosts (e.g. Hostinger) do not grant access to.
  const host = hostname === "localhost" ? "127.0.0.1" : hostname;

  let port = 3306;
  if (url.port) {
    port = Number(url.port);
    if (!Number.isInteger(port) || port <= 0) {
      throw new Error(`DATABASE_URL has an invalid port: "${url.port}".`);
    }
  }

  return { host, port, user, password, database };
}

export const pool = mysql.createPool(buildPoolConfig(process.env.DATABASE_URL));
export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";

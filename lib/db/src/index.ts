import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function buildPoolConfig(raw: string): mysql.PoolOptions {
  const noProto = raw.replace(/^mysql:\/\//, "");
  const at = noProto.lastIndexOf("@");
  const creds = noProto.slice(0, at);
  const hostpart = noProto.slice(at + 1);
  const colon = creds.indexOf(":");
  const user = decodeURIComponent(creds.slice(0, colon));
  const password = decodeURIComponent(creds.slice(colon + 1));
  const slash = hostpart.indexOf("/");
  const hostPort = slash === -1 ? hostpart : hostpart.slice(0, slash);
  const database = slash === -1 ? "" : hostpart.slice(slash + 1).split("?")[0];
  const [hostRaw, portRaw] = hostPort.split(":");
  // Force IPv4 loopback: Node resolves "localhost" to IPv6 (::1), which many
  // managed MySQL hosts (e.g. Hostinger) do not grant access to.
  const host = hostRaw === "localhost" ? "127.0.0.1" : hostRaw;
  return {
    host,
    port: portRaw ? Number(portRaw) : 3306,
    user,
    password,
    database,
  };
}

export const pool = mysql.createPool(buildPoolConfig(process.env.DATABASE_URL));
export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";

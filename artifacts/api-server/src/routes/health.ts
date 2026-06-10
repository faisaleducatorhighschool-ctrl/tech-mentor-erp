import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/diag/db", async (_req, res) => {
  const out: Record<string, unknown> = {};
  try {
    const u = new URL(
      (process.env.DATABASE_URL ?? "").replace(/^mysql:\/\//, "http://"),
    );
    out.connect = {
      host: u.hostname,
      port: u.port,
      database: u.pathname.slice(1),
      user: u.username,
      passwordLength: u.password.length,
    };
  } catch (e) {
    out.urlParseError = (e as Error).message;
  }
  try {
    const [r] = await pool.query("SELECT 1 AS ok");
    out.select1 = r;
  } catch (e) {
    const err = e as { message?: string; code?: string; errno?: number };
    out.select1Error = { message: err.message, code: err.code, errno: err.errno };
  }
  try {
    const [r] = await pool.query("SELECT COUNT(*) AS c FROM settings");
    out.settingsCount = r;
  } catch (e) {
    const err = e as { message?: string; code?: string; errno?: number };
    out.settingsError = { message: err.message, code: err.code, errno: err.errno };
  }
  try {
    const [r] = await pool.query(
      "SELECT COUNT(*) AS c FROM business_config",
    );
    out.businessConfigCount = r;
  } catch (e) {
    const err = e as { message?: string; code?: string; errno?: number };
    out.businessConfigError = {
      message: err.message,
      code: err.code,
      errno: err.errno,
    };
  }
  res.json(out);
});

export default router;

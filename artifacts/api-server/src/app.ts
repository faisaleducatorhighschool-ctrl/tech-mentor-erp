import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

// Directory of the running module. After bundling, index.mjs lives in dist/,
// and the web ERP static export is copied to dist/web-erp by build.mjs.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const webErpDir = path.join(moduleDir, "web-erp");
const hasWebErp = existsSync(path.join(webErpDir, "index.html"));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

app.use("/api", router);

app.use("/api", (_req, res: express.Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Serve the staff ERP web app (Expo web export) from the same domain.
// Static assets first, then an SPA fallback so client-side routes (e.g. /login)
// resolve to index.html. Non-/api requests are handled here.
if (hasWebErp) {
  app.use(express.static(webErpDir));
  app.use((_req, res: express.Response) => {
    res.sendFile(path.join(webErpDir, "index.html"));
  });
} else {
  logger.warn(
    { webErpDir },
    "web-erp static export not found; serving API only",
  );
}

export default app;

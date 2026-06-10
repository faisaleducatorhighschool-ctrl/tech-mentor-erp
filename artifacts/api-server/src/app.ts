import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

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

app.get("/", (_req, res: express.Response) => {
  res
    .status(200)
    .type("html")
    .send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Faisal Book Depot — Server Status</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 24px;
  }
  .card {
    background: #fff; border-radius: 20px; padding: 40px 36px; max-width: 460px; width: 100%;
    box-shadow: 0 20px 50px rgba(0,0,0,.2); text-align: center;
  }
  .badge {
    width: 76px; height: 76px; border-radius: 50%; margin: 0 auto 20px;
    display: flex; align-items: center; justify-content: center;
    background: #ecfdf5; border: 3px solid #10b981;
  }
  .badge svg { width: 40px; height: 40px; stroke: #10b981; }
  h1 { margin: 0 0 6px; font-size: 22px; color: #0f172a; }
  .live { display: inline-flex; align-items: center; gap: 8px; margin: 8px 0 18px;
    color: #047857; font-weight: 600; font-size: 15px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: #10b981;
    box-shadow: 0 0 0 0 rgba(16,185,129,.6); animation: pulse 1.8s infinite; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.5);} 70% { box-shadow: 0 0 0 12px rgba(16,185,129,0);} 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0);} }
  p { color: #475569; line-height: 1.6; font-size: 15px; margin: 0 0 14px; }
  .note { font-size: 13px; color: #94a3b8; margin-top: 18px; }
</style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
    <h1>Faisal Book Depot</h1>
    <div class="live"><span class="dot"></span> Server is live and running</div>
    <p>Your store's engine is online and serving data to your web, Android, and staff apps.</p>
    <p class="note">This is the backend service. Customers use the store apps, not this page.</p>
  </div>
</body>
</html>`);
});

app.use("/api", router);

app.use("/api", (_req, res: express.Response) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;

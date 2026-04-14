import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const PORT = Number(process.env.PORT || 3001);
const TRUST_PROXY = process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true";
const BETA_API_KEY = (process.env.BETA_API_KEY || "").trim();

function parseOrigins() {
  const raw = (process.env.CORS_ORIGIN || "").trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (process.env.NODE_ENV !== "production") {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ];
  }
  return [];
}

const allowedOrigins = parseOrigins();

const app = express();
if (TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.json({ limit: "32kb" }));

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) {
        return cb(new Error("CORS_ORIGIN is not configured for production"));
      }
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    maxAge: 86400,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

function requireBetaKey(req, res, next) {
  if (!BETA_API_KEY) return next();
  const key = req.get("x-beta-key");
  if (key !== BETA_API_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  return next();
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "koli-api",
    ts: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "koli-api",
    ts: new Date().toISOString(),
  });
});

app.post("/api/echo", requireBetaKey, (req, res) => {
  res.json({ ok: true, received: req.body ?? null });
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "not_found" });
});

app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("CORS")) {
    return res.status(403).json({ ok: false, error: "cors" });
  }
  console.error(err);
  return res.status(500).json({ ok: false, error: "internal" });
});

app.listen(PORT, () => {
  console.log(`koli-api listening on port ${PORT}`);
  if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
    console.warn(
      "WARNING: CORS_ORIGIN is not set — set it to your frontend URL(s), comma-separated (e.g. https://app.example.com), or browsers will get CORS errors."
    );
  }
});
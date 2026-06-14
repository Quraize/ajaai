import express from "express";
import cors from "cors";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: express.Application = express();

const isProduction = process.env.NODE_ENV === "production";
const clientOrigin = process.env.CLIENT_ORIGIN;

if (isProduction && clientOrigin) {
  app.use(cors({ origin: clientOrigin, credentials: true }));
} else {
  app.use(cors());
}

app.use(express.json({ limit: "10mb" }));

function createRedisStore(prefix: string) {
  const url = process.env.REDIS_URL;
  if (!url) return undefined;

  const client = createClient({ url });
  client.on("error", (err) => console.error("Redis client error:", err));
  client.connect().catch((err) => console.error("Redis connection failed:", err));

  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => client.sendCommand(args),
  });
}

function createAuthLimiter(prefix: string) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    store: createRedisStore(prefix),
    keyGenerator: (req: express.Request) => {
      if (req.body?.email) {
        return String(req.body.email).toLowerCase();
      }
      return ipKeyGenerator(req.ip || "unknown");
    },
    message: { error: "Too many attempts. Please try again later." },
  });
}

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth/login", createAuthLimiter("rl:login"));
app.use("/api/auth/register", createAuthLimiter("rl:register"));
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

const webDist = path.resolve(__dirname, "../../web/dist");
if (isProduction && fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;

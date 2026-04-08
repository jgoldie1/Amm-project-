const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

function projectRoot() {
  return path.resolve(__dirname, "..", "..");
}

function dataFile(name) {
  return path.join(projectRoot(), "data", name);
}

function ensureFile(name, fallback = "[]") {
  const file = dataFile(name);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, fallback, "utf8");
  }
  return file;
}

function readJson(name, fallback = []) {
  const file = ensureFile(name, JSON.stringify(fallback, null, 2));
  const raw = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(name, value) {
  const file = ensureFile(name, "[]");
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}

function nextId(items) {
  if (!Array.isArray(items) || items.length === 0) return 1;
  return Math.max(...items.map((x) => Number(x.id) || 0)) + 1;
}

function recordAudit({ actorUserId = null, actorRole = null, action, entityType, entityId = null, payload = null }) {
  const events = readJson("admin_events.json", []);
  const event = {
    id: nextId(events),
    actorUserId,
    actorRole,
    action,
    entityType,
    entityId,
    payload,
    createdAt: new Date().toISOString()
  };
  events.push(event);
  writeJson("admin_events.json", events);
  return event;
}

function makeApp(serviceName, port, extraRoutes) {
  require("dotenv").config({ path: require("path").resolve(projectRoot(), ".env") });
  const express = require("express");
  const cors = require("cors");
  const helmet = require("helmet");
  const morgan = require("morgan");

  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: serviceName,
      port,
      timestamp: new Date().toISOString()
    });
  });

  if (typeof extraRoutes === "function") {
    extraRoutes(app);
  }

  app.use((err, _req, res, _next) => {
    console.error(`[${serviceName}]`, err);
    res.status(500).json({
      ok: false,
      service: serviceName,
      error: err.message || "Internal server error"
    });
  });

  return app;
}

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "missing token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "invalid token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: "forbidden" });
    }
    next();
  };
}

module.exports = {
  projectRoot,
  dataFile,
  readJson,
  writeJson,
  nextId,
  makeApp,
  authMiddleware,
  requireRole,
  recordAudit
};

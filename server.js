const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Server } = require("socket.io");
const GAMEVERSE = require("./data/gameverse.json");
const PLATFORM_STATUS = require("./data/platform-status.json");
const GAMEOPS_POLICY = require("./data/gameops-policy.json");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const SITE_URL = (process.env.SITE_URL || "https://tryamm.online").replace(/\/$/, "");
const GAMEOPS_LOG_PATH = process.env.GAMEOPS_LOG_PATH || path.join(process.cwd(), "runtime", "gameops-incidents.jsonl");
const gameOpsIncidents = [];

function appendGameOpsRecord(record) {
  try {
    fs.mkdirSync(path.dirname(GAMEOPS_LOG_PATH), { recursive: true });
    fs.appendFileSync(GAMEOPS_LOG_PATH, `${JSON.stringify(record)}\n`, "utf8");
  } catch (error) {
    console.error("GameOps audit-log write failed", error.message);
  }
}

function requireGameOpsSecret(req, res, next) {
  const secret = process.env.GAMEOPS_INTERNAL_SECRET;
  if (!secret) return res.status(503).json({ error: "GameOps internal secret is not configured" });
  if (req.get("authorization") !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.use(express.json({ limit: "100kb" }));
app.use(express.static("public", {
  extensions: ["html"],
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
  },
}));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tryamm", site: SITE_URL });
});

app.get("/api/social-links", (_req, res) => {
  const links = {
    facebook: process.env.FACEBOOK_URL || "",
    instagram: process.env.INSTAGRAM_URL || "",
    tiktok: process.env.TIKTOK_URL || "",
  };

  const configured = Object.fromEntries(
    Object.entries(links).filter(([, value]) => typeof value === "string" && /^https:\/\//i.test(value))
  );

  res.json(configured);
});

app.get("/api/platform/status", (_req, res) => {
  const counts = PLATFORM_STATUS.domains.reduce((acc, domain) => {
    acc[domain.status] = (acc[domain.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    product: PLATFORM_STATUS.product,
    counts,
    domains: PLATFORM_STATUS.domains,
    note: "Status reflects the connected GitHub repository, not every idea discussed historically.",
  });
});

app.get("/api/gameverse", (_req, res) => {
  res.json(GAMEVERSE);
});

app.get("/api/gameverse/status", (_req, res) => {
  const totals = GAMEVERSE.games.reduce((acc, game) => {
    acc[game.status] = (acc[game.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    platform: GAMEVERSE.platform,
    livingGameWorld: GAMEVERSE.world.status,
    gameCount: GAMEVERSE.games.length,
    totals,
    productionPlayableCount: GAMEVERSE.games.filter((game) => game.status === "production").length,
    note: "Foundation status does not mean a title is fully playable, tested or deployed.",
  });
});

app.get("/api/gameverse/games/:id", (req, res) => {
  const game = GAMEVERSE.games.find((item) => item.id === req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(game);
});

// AI GameOps control-plane foundation. AI/telemetry agents report issues here,
// attach diagnosis/fix proposals, and preserve an auditable record for James/Victor.
app.get("/api/gameops/policy", (_req, res) => {
  res.json(GAMEOPS_POLICY);
});

app.post("/api/gameops/issues", requireGameOpsSecret, (req, res) => {
  const { gameId, source, severity, category, summary, details, reportedBy } = req.body || {};
  const knownGame = GAMEVERSE.games.some((game) => game.id === gameId);
  if (!knownGame) return res.status(400).json({ error: "Unknown gameId" });
  if (!summary || typeof summary !== "string") return res.status(400).json({ error: "summary is required" });

  const incident = {
    id: crypto.randomUUID(),
    gameId,
    source: source || "unknown",
    severity: severity || "medium",
    category: category || "unknown",
    summary: summary.slice(0, 500),
    details: typeof details === "string" ? details.slice(0, 5000) : "",
    status: "reported",
    detectedAt: new Date().toISOString(),
    reportedBy: reportedBy || "ai-or-system",
    aiDiagnosis: null,
    proposedFix: null,
    approvalRequired: !GAMEOPS_POLICY.autoFixAllowlist.includes(category),
    approvedBy: null,
    fixAppliedAt: null,
    validation: null,
    rollback: null,
    closedAt: null,
  };

  gameOpsIncidents.unshift(incident);
  if (gameOpsIncidents.length > 1000) gameOpsIncidents.length = 1000;
  appendGameOpsRecord({ event: "incident.reported", incident });
  io.emit("gameops:incident", incident);
  res.status(201).json(incident);
});

app.get("/api/gameops/issues", requireGameOpsSecret, (_req, res) => {
  res.json({ incidents: gameOpsIncidents, persistence: GAMEOPS_LOG_PATH });
});

app.post("/api/gameops/issues/:id/ai-analysis", requireGameOpsSecret, (req, res) => {
  const incident = gameOpsIncidents.find((item) => item.id === req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const { diagnosis, proposedFix, validationPlan, rollbackPlan, model } = req.body || {};
  if (!diagnosis || !proposedFix) return res.status(400).json({ error: "diagnosis and proposedFix are required" });

  incident.aiDiagnosis = { text: String(diagnosis).slice(0, 5000), model: model || "unspecified", at: new Date().toISOString() };
  incident.proposedFix = String(proposedFix).slice(0, 5000);
  incident.validation = validationPlan ? { plan: String(validationPlan).slice(0, 5000), result: null } : null;
  incident.rollback = rollbackPlan ? { plan: String(rollbackPlan).slice(0, 5000), executed: false } : null;
  incident.status = incident.approvalRequired ? "awaiting-approval" : "approved-for-bounded-auto-fix";

  appendGameOpsRecord({ event: "incident.ai-analysis", incidentId: incident.id, snapshot: incident });
  io.emit("gameops:update", incident);
  res.json(incident);
});

app.post("/api/gameops/issues/:id/approve", requireGameOpsSecret, (req, res) => {
  const incident = gameOpsIncidents.find((item) => item.id === req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  incident.approvedBy = req.body?.approvedBy || "authorized-human";
  incident.status = "approved-for-fix";
  appendGameOpsRecord({ event: "incident.approved", incidentId: incident.id, approvedBy: incident.approvedBy, at: new Date().toISOString() });
  io.emit("gameops:update", incident);
  res.json(incident);
});

app.post("/api/gameops/issues/:id/fix-result", requireGameOpsSecret, (req, res) => {
  const incident = gameOpsIncidents.find((item) => item.id === req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  if (incident.approvalRequired && incident.status !== "approved-for-fix") {
    return res.status(409).json({ error: "Human approval is required before recording a fix as applied" });
  }

  const { appliedBy, changeReference, validationResult, success } = req.body || {};
  incident.fixAppliedAt = new Date().toISOString();
  incident.status = success === false ? "fix-failed" : "fixed-pending-validation";
  incident.validation = {
    ...(incident.validation || {}),
    result: validationResult || null,
    changeReference: changeReference || null,
    appliedBy: appliedBy || "ai-or-developer",
  };

  appendGameOpsRecord({ event: "incident.fix-result", incidentId: incident.id, snapshot: incident });
  io.emit("gameops:update", incident);
  res.json(incident);
});

app.post("/api/gameops/issues/:id/close", requireGameOpsSecret, (req, res) => {
  const incident = gameOpsIncidents.find((item) => item.id === req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  incident.status = "closed";
  incident.closedAt = new Date().toISOString();
  incident.validation = { ...(incident.validation || {}), closureNote: req.body?.closureNote || "" };
  appendGameOpsRecord({ event: "incident.closed", incidentId: incident.id, snapshot: incident });
  io.emit("gameops:update", incident);
  res.json(incident);
});

app.post("/api/indexnow", async (req, res) => {
  try {
    const key = process.env.INDEXNOW_KEY;
    const internalSecret = process.env.INTERNAL_PUBLISH_WEBHOOK_SECRET;

    if (!key) {
      return res.status(503).json({ error: "IndexNow is not configured" });
    }

    if (internalSecret) {
      const auth = req.get("authorization");
      if (auth !== `Bearer ${internalSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const requestedUrls = Array.isArray(req.body?.urls) ? req.body.urls : [];
    const siteOrigin = new URL(SITE_URL).origin;
    const urls = requestedUrls
      .filter((value) => typeof value === "string")
      .filter((value) => {
        try {
          return new URL(value).origin === siteOrigin;
        } catch {
          return false;
        }
      })
      .slice(0, 10000);

    if (!urls.length) {
      return res.status(400).json({ error: "No valid TryAMM URLs supplied" });
    }

    const payload = JSON.stringify({
      host: new URL(SITE_URL).host,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: urls,
    });

    const request = https.request(
      "https://api.indexnow.org/indexnow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (indexNowResponse) => {
        indexNowResponse.resume();
        res.status(indexNowResponse.statusCode >= 200 && indexNowResponse.statusCode < 300 ? 200 : 502).json({
          ok: indexNowResponse.statusCode >= 200 && indexNowResponse.statusCode < 300,
          status: indexNowResponse.statusCode,
          submitted: urls.length,
        });
      }
    );

    request.on("error", () => {
      res.status(502).json({ error: "IndexNow submission failed" });
    });

    request.write(payload);
    request.end();
  } catch {
    res.status(500).json({ error: "IndexNow submission failed" });
  }
});

let hearts = 0;
let gifts = 0;

io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("init", { hearts, gifts });

  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });

  socket.on("heart", () => {
    hearts++;
    io.emit("heart", hearts);
  });

  socket.on("gift", () => {
    gifts++;
    io.emit("gift", gifts);
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log(`Server running for ${SITE_URL}`);
});

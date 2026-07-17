const express = require("express");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const faithPlans = [
  {
    id: "faith-free",
    name: "Faith Community",
    priceMonthly: 0,
    features: ["Scripture study", "Prayer wall", "Public livestreams", "Youth-safe access"]
  },
  {
    id: "faith-premium",
    name: "Faith Premium",
    priceMonthly: 14.99,
    promotion: "Pay for 1 month and receive the next 2 months free",
    features: [
      "Premium courses",
      "Ministry creator tools",
      "Private groups",
      "Expanded cloud storage",
      "AR/VR/MR worship rooms",
      "Holographic event eligibility"
    ]
  },
  {
    id: "faith-ministry",
    name: "Ministry",
    priceMonthly: 49.99,
    promotion: "Eligible ministries can use invite code YAHAVAH-MINISTRY-3X",
    features: [
      "Multi-admin ministry workspace",
      "Member onboarding",
      "Giving and event tools",
      "Verified ministry application",
      "Premium streaming and analytics"
    ]
  }
];

const games = [
  "AAM Laser Tag",
  "Streaming Battle Arena",
  "Turn-Based Battle",
  "Yogihoo Holographic Card Battle",
  "Creator Sports Arena",
  "Open-World City Demo",
  "Tactical Team Arena",
  "Racing Universe",
  "Faith Quest",
  "Education Adventure",
  "Starverse Rhythm Battle"
].map((name, index) => ({
  id: `game-${String(index + 1).padStart(2, "0")}`,
  name,
  status: "planned-vertical-slice",
  sharedSystems: ["identity", "wallet", "inventory", "matchmaking", "cloud-save", "moderation"]
}));

const performanceProfiles = {
  auto: { targetFps: 60, resolutionScale: "dynamic", effects: "adaptive" },
  battery: { targetFps: 30, resolutionScale: 0.7, effects: "low" },
  balanced: { targetFps: 45, resolutionScale: 0.85, effects: "medium" },
  quality: { targetFps: 60, resolutionScale: 1, effects: "high" },
  cinematic: { targetFps: 30, resolutionScale: 1, effects: "ultra", note: "Supported devices only" }
};

const platformModules = [
  "AI Game Production Agent",
  "Adaptive Performance Manager",
  "Faith Premium",
  "Faith Ministry Onboarding",
  "Set Apart Ride Share",
  "Aniyah 64-Track Music Studio",
  "Aniyah Vocal Coach",
  "Anime and Cosplay Studio",
  "Dramabox",
  "Starverse",
  "Isaiah AI TV",
  "Jacobie Vision Cybersecurity",
  "Universal Asset Vault",
  "AR/VR/MR and Holographic Studio"
];

const jobs = new Map();
let hearts = 0;
let gifts = 0;

app.get("/api/platform/config", (_req, res) => {
  res.json({
    name: "TryAMM",
    modules: platformModules,
    performanceProfiles,
    holographicRevenueSplit: { creator: 80, platform: 20 },
    buildStatus: "foundation",
    warning: "The listed studios and games require provider integrations, assets, testing, and production deployment before they are complete."
  });
});

app.get("/api/games", (_req, res) => {
  res.json({ games, qualityGoal: "AAA-inspired vertical slices with scalable device presets" });
});

app.get("/api/faith/plans", (_req, res) => {
  res.json({ plans: faithPlans });
});

app.post("/api/faith/promo/validate", (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  const validCodes = {
    "FAITH-1PLUS2": { planId: "faith-premium", paidMonths: 1, freeMonths: 2 },
    "YAHAVAH-MINISTRY-3X": { planId: "faith-ministry", paidMonths: 1, freeMonths: 2, requiresMinistryVerification: true }
  };

  const offer = validCodes[code];
  if (!offer) {
    return res.status(404).json({ valid: false, message: "Promotion code not recognized." });
  }

  return res.json({ valid: true, offer });
});

app.post("/api/agents/game-production/jobs", (req, res) => {
  const { gameId, task, performanceProfile = "auto" } = req.body || {};
  const game = games.find((item) => item.id === gameId);

  if (!game || !task || !performanceProfiles[performanceProfile]) {
    return res.status(400).json({
      error: "gameId, task, and a valid performanceProfile are required."
    });
  }

  const job = {
    id: crypto.randomUUID(),
    gameId,
    gameName: game.name,
    task: String(task).slice(0, 500),
    performanceProfile,
    status: "queued",
    createdAt: new Date().toISOString(),
    steps: [
      "design-brief",
      "asset-plan",
      "gameplay-scaffold",
      "performance-budget",
      "quality-check"
    ],
    note: "This endpoint currently queues a foundation job. Connect approved AI, asset, build, and test workers before production use."
  };

  jobs.set(job.id, job);
  res.status(202).json(job);
});

app.get("/api/agents/game-production/jobs/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found." });
  return res.json(job);
});

app.get("/api/rideshare/set-apart", (_req, res) => {
  res.json({
    name: "Set Apart Ride Share",
    status: "planned",
    services: [
      "Standard rides",
      "Accessible rides",
      "Women-focused safety options",
      "Senior transportation",
      "Delivery",
      "Medical appointment transportation through qualified partners"
    ],
    requiredBeforeLaunch: [
      "Driver screening",
      "Insurance and licensing review",
      "Emergency support",
      "Location and trip safety",
      "Payments and driver payouts"
    ]
  });
});

io.on("connection", (socket) => {
  socket.emit("init", { hearts, gifts });
  socket.on("chat", (msg) => io.emit("chat", String(msg || "").slice(0, 500)));
  socket.on("heart", () => io.emit("heart", ++hearts));
  socket.on("gift", () => io.emit("gift", ++gifts));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("TryAMM foundation server running");
});

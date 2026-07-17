const express = require("express");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");
const { progressionFramework } = require("./gameProgression");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const faithPlans = [
  { id: "faith-free", name: "Faith Community", priceMonthly: 0, features: ["Scripture study", "Prayer wall", "Public livestreams", "Youth-safe access"] },
  { id: "faith-premium", name: "Faith Premium", priceMonthly: 14.99, promotion: "Buy 1 month and receive 1 month free", features: ["Premium courses", "Ministry creator tools", "Private groups", "Expanded cloud storage", "AR/VR/MR worship rooms", "Holographic event eligibility"] },
  { id: "faith-ministry", name: "Ministry", priceMonthly: 49.99, promotion: "Verified ministries can use an approved invitation code", features: ["Multi-admin ministry workspace", "Member onboarding", "Giving and event tools", "Verified ministry application", "Premium streaming and analytics"] }
];

const games = ["AAM Laser Tag", "Streaming Battle Arena", "Turn-Based Battle", "Yogihoo Holographic Card Battle", "Creator Sports Arena", "Open-World City Demo", "Tactical Team Arena", "Racing Universe", "Faith Quest", "Education Adventure", "Starverse Rhythm Battle"].map((name, index) => ({
  id: `game-${String(index + 1).padStart(2, "0")}`,
  name,
  status: "planned-vertical-slice",
  progression: progressionFramework,
  sharedSystems: ["identity", "wallet", "inventory", "matchmaking", "cloud-save", "moderation"]
}));

const performanceProfiles = {
  auto: { targetFps: 60, resolutionScale: "dynamic", effects: "adaptive" },
  battery: { targetFps: 30, resolutionScale: 0.7, effects: "low" },
  balanced: { targetFps: 45, resolutionScale: 0.85, effects: "medium" },
  quality: { targetFps: 60, resolutionScale: 1, effects: "high" },
  cinematic: { targetFps: 30, resolutionScale: 1, effects: "ultra", note: "Supported devices only" }
};

const platformModules = ["AI Game Production Agent", "Adaptive Performance Manager", "Game Future Fund", "Family and Community Referral Program", "Promotion Admin Center", "Creator Mentorship Program", "Family Business Dashboard", "Scholarship and Education Fund", "Community Grant Program", "Volunteer Program", "Creator Incubator", "AI Training Academy", "Public Roadmap", "Beta Testing Community", "Bug Bounty Program", "Accessibility Testing Panel", "Creator Advisory Council", "Faith Advisory Council", "Faith Premium", "Faith Ministry Onboarding", "Set Apart Ride Share", "Aniyah 64-Track Music Studio", "Aniyah Vocal Coach", "Anime and Cosplay Studio", "Dramabox", "Starverse", "Isaiah AI TV", "Jacobie Vision Cybersecurity", "Universal Asset Vault", "AR/VR/MR and Holographic Studio"];

const makeCode = (name, suffix) => `${name.replace(/[^a-z0-9]/gi, "").toUpperCase()}-${suffix}`;
const familyNames = ["James", "Sarah", "Jacobie", "Isaiah", "Aniyah", "Al", "Kevon", "Don", "Carlton", "Kenny", "Mike", "Shawndell", "Ashley", "Delvell", "Keshawn", "Ashley"];
const referralPartners = familyNames.map((displayName, index) => ({ id: crypto.randomUUID(), displayName, code: makeCode(displayName, String(index + 1).padStart(2, "0")), status: "active", qualifiedConversions: 0, pendingRewardCents: 0, paidRewardCents: 0 }));

const promotions = new Map([
  ["FAITH-1PLUS1", { code: "FAITH-1PLUS1", planId: "faith-premium", paidMonths: 1, freeMonths: 1, active: true, requiresVerification: false }],
  ["YAHAVAH-MINISTRY-1PLUS1", { code: "YAHAVAH-MINISTRY-1PLUS1", planId: "faith-ministry", paidMonths: 1, freeMonths: 1, active: true, requiresVerification: true }]
]);

const businessConfig = {
  holographicRevenueSplit: { creatorPercent: 80, platformPercent: 20 },
  gameFutureFund: { percentOfPlatformNetGamingShare: 25, uses: ["New game development", "Servers and online services", "Accessibility improvements", "Tournaments and community events", "Quality assurance and security", "New levels and seasonal content"] },
  referralProgram: {
    rewardCentsPerQualifiedPaidConversion: 100,
    qualification: ["New customer uses a valid referral code", "Customer verifies the account", "Customer completes the first paid month", "Payment clears the refund and fraud-review window"],
    customerOffer: { paidMonths: 1, freeMonths: 1 },
    minimumPayoutCents: 2500,
    fraudReviewRequired: true
  }
};

const jobs = new Map();
const referralEvents = new Map();
let hearts = 0;
let gifts = 0;

function requireAdmin(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) return res.status(503).json({ error: "Admin writes are disabled until ADMIN_API_KEY is configured." });
  const suppliedKey = req.get("x-admin-key") || "";
  const left = Buffer.from(suppliedKey);
  const right = Buffer.from(configuredKey);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return res.status(401).json({ error: "Unauthorized." });
  next();
}

app.get("/api/platform/config", (_req, res) => res.json({ name: "TryAMM", modules: platformModules, performanceProfiles, businessConfig, buildStatus: "foundation", warning: "These routes are a working foundation. Production requires persistent storage, authentication, payments, provider integrations, game-engine workers, security review, and end-to-end testing." }));
app.get("/api/games", (_req, res) => res.json({ games, qualityGoal: "AAA-inspired vertical slices with consistent art direction and scalable device presets", aiAgentResponsibilities: ["Level planning", "Asset budgets", "Enemy placement", "Dialogue drafts", "Difficulty balancing", "Optimization checks", "Automated test-case drafts"], humanApprovalRequired: ["Gameplay", "Art direction", "Safety", "Final builds"] }));
app.get("/api/faith/plans", (_req, res) => res.json({ plans: faithPlans }));

function validatePromotion(req, res) {
  const code = String(req.body?.code || "").trim().toUpperCase();
  const offer = promotions.get(code);
  if (!offer || !offer.active) return res.status(404).json({ valid: false, message: "Promotion code not recognized or inactive." });
  return res.json({ valid: true, offer });
}
app.post("/api/promotions/validate", validatePromotion);
app.post("/api/faith/promo/validate", validatePromotion);

app.get("/api/referrals/partners", (_req, res) => res.json({ partners: referralPartners.map(({ id, displayName, code, status }) => ({ id, displayName, code, status })), program: businessConfig.referralProgram }));
app.post("/api/referrals/register", (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  const customerReference = String(req.body?.customerReference || "").trim().slice(0, 100);
  const partner = referralPartners.find((item) => item.code === code && item.status === "active");
  if (!partner || !customerReference) return res.status(400).json({ error: "A valid referral code and customerReference are required." });
  const event = { id: crypto.randomUUID(), partnerId: partner.id, code, customerReference, status: "registered", createdAt: new Date().toISOString(), rewardCents: businessConfig.referralProgram.rewardCentsPerQualifiedPaidConversion };
  referralEvents.set(event.id, event);
  res.status(201).json({ event, customerOffer: businessConfig.referralProgram.customerOffer, note: "Reward remains pending until verification, first paid month, refund window, and fraud review are complete." });
});

app.get("/api/admin/config", requireAdmin, (_req, res) => res.json({ businessConfig, promotions: [...promotions.values()], referralPartners }));
app.patch("/api/admin/config", requireAdmin, (req, res) => {
  const { gameFundPercent, referralRewardCents, minimumPayoutCents } = req.body || {};
  if (gameFundPercent !== undefined) {
    const value = Number(gameFundPercent);
    if (!Number.isFinite(value) || value < 0 || value > 100) return res.status(400).json({ error: "gameFundPercent must be 0-100." });
    businessConfig.gameFutureFund.percentOfPlatformNetGamingShare = value;
  }
  if (referralRewardCents !== undefined) {
    const value = Number(referralRewardCents);
    if (!Number.isInteger(value) || value < 0 || value > 100000) return res.status(400).json({ error: "referralRewardCents must be an integer from 0-100000." });
    businessConfig.referralProgram.rewardCentsPerQualifiedPaidConversion = value;
  }
  if (minimumPayoutCents !== undefined) {
    const value = Number(minimumPayoutCents);
    if (!Number.isInteger(value) || value < 0) return res.status(400).json({ error: "minimumPayoutCents must be a nonnegative integer." });
    businessConfig.referralProgram.minimumPayoutCents = value;
  }
  res.json({ updated: true, businessConfig });
});

app.post("/api/admin/promotions", requireAdmin, (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  const planId = String(req.body?.planId || "").trim();
  const paidMonths = Number(req.body?.paidMonths);
  const freeMonths = Number(req.body?.freeMonths);
  if (!/^[A-Z0-9-]{4,40}$/.test(code) || !planId || !Number.isInteger(paidMonths) || !Number.isInteger(freeMonths) || paidMonths < 0 || freeMonths < 0) return res.status(400).json({ error: "Valid code, planId, paidMonths, and freeMonths are required." });
  const promotion = { code, planId, paidMonths, freeMonths, active: req.body?.active !== false, requiresVerification: req.body?.requiresVerification === true };
  promotions.set(code, promotion);
  res.status(201).json({ promotion });
});

app.post("/api/admin/referral-partners", requireAdmin, (req, res) => {
  const displayName = String(req.body?.displayName || "").trim().slice(0, 80);
  const requestedCode = String(req.body?.code || "").trim().toUpperCase();
  if (!displayName) return res.status(400).json({ error: "displayName is required." });
  const code = requestedCode || makeCode(displayName, crypto.randomBytes(2).toString("hex").toUpperCase());
  if (!/^[A-Z0-9-]{4,40}$/.test(code) || referralPartners.some((item) => item.code === code)) return res.status(409).json({ error: "Referral code is invalid or already exists." });
  const partner = { id: crypto.randomUUID(), displayName, code, status: "active", qualifiedConversions: 0, pendingRewardCents: 0, paidRewardCents: 0 };
  referralPartners.push(partner);
  res.status(201).json({ partner });
});

app.post("/api/admin/referrals/:eventId/qualify", requireAdmin, (req, res) => {
  const event = referralEvents.get(req.params.eventId);
  if (!event) return res.status(404).json({ error: "Referral event not found." });
  if (event.status === "qualified") return res.json({ event, duplicate: true });
  event.status = "qualified";
  event.qualifiedAt = new Date().toISOString();
  const partner = referralPartners.find((item) => item.id === event.partnerId);
  if (partner) { partner.qualifiedConversions += 1; partner.pendingRewardCents += event.rewardCents; }
  res.json({ event, partner });
});

app.post("/api/agents/game-production/jobs", (req, res) => {
  const { gameId, task, performanceProfile = "auto" } = req.body || {};
  const game = games.find((item) => item.id === gameId);
  if (!game || !task || !performanceProfiles[performanceProfile]) return res.status(400).json({ error: "gameId, task, and a valid performanceProfile are required." });
  const job = { id: crypto.randomUUID(), gameId, gameName: game.name, task: String(task).slice(0, 500), performanceProfile, status: "queued", createdAt: new Date().toISOString(), steps: ["design-brief", "level-plan", "asset-budget", "enemy-and-npc-placement", "dialogue-draft", "difficulty-balance", "performance-budget", "optimization-check", "test-case-draft", "human-approval-gate"], note: "This foundation queues the job. Connect approved AI, game-engine, asset, build, test, and human-review workers before production use." };
  jobs.set(job.id, job);
  res.status(202).json(job);
});
app.get("/api/agents/game-production/jobs/:jobId", (req, res) => { const job = jobs.get(req.params.jobId); if (!job) return res.status(404).json({ error: "Job not found." }); return res.json(job); });

app.get("/api/rideshare/set-apart", (_req, res) => res.json({ name: "Set Apart Ride Share", status: "planned", services: ["Standard rides", "Accessible rides", "Women-focused safety options", "Senior transportation", "Delivery", "Medical appointment transportation through qualified partners"], requiredBeforeLaunch: ["Driver screening", "Insurance and licensing review", "Emergency support", "Location and trip safety", "Payments and driver payouts"] }));

io.on("connection", (socket) => {
  socket.emit("init", { hearts, gifts });
  socket.on("chat", (msg) => io.emit("chat", String(msg || "").slice(0, 500)));
  socket.on("heart", () => io.emit("heart", ++hearts));
  socket.on("gift", () => io.emit("gift", ++gifts));
});

app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: "Unexpected server error." }); });
server.listen(process.env.PORT || 10000, () => console.log("TryAMM foundation server running"));

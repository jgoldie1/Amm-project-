require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { initializePayment, verifyWebhook, createPayout, getProvider } = require("./services/payments");

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_DIR = path.join(__dirname, "data");
const KNOWLEDGE_FILE = path.join(DATA_DIR, "knowledge.json");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");
const PAYMENT_EVENTS_FILE = path.join(DATA_DIR, "payment-events.json");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || true }));
app.use("/api/payments/webhooks/:provider", express.raw({ type: "application/json", limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true }));

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function tokenize(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9'\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function searchKnowledge(query, mode) {
  const docs = readJson(KNOWLEDGE_FILE, []);
  const terms = new Set(tokenize(query));
  return docs.map((doc) => {
    const haystack = tokenize(`${doc.title} ${doc.category} ${doc.tags.join(" ")} ${doc.content}`);
    let score = haystack.reduce((sum, word) => sum + (terms.has(word) ? 1 : 0), 0);
    if (doc.modes.includes(mode)) score += 3;
    return { ...doc, score };
  }).filter((doc) => doc.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
}

const modeInstructions = {
  quick: "Answer briefly, clearly, and with immediate next actions.",
  creator: "Act as a practical creator coach for music, video, livestreaming, drama, anime and marketplace publishing.",
  faith: "Use respectful faith-aware language. Refer to Yahavah, Yahusha Ha Mashiach and the Ruach where relevant. Separate Scripture, interpretation and fictional storytelling.",
  accessibility: "Use short numbered steps, one-handed and voice-first directions, and avoid unnecessary complexity.",
  nerd: "Go deep on anime, manga, games, cosplay, lore, power systems, worldbuilding and production details."
};

async function callModel({ message, mode, sources, history }) {
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!apiUrl || !apiKey || !model) return null;

  const system = `You are AMM Intelligence for TryAMM.online. Be warm, intelligent, specific and honest. Never invent account, order, payment, Scripture or catalog facts. ${modeInstructions[mode] || modeInstructions.quick}\n\nApproved TryAMM knowledge:\n${sources.map((s) => `- ${s.title}: ${s.content}`).join("\n")}`;
  const messages = [
    { role: "system", content: system },
    ...history.slice(-8).map((item) => ({ role: item.role, content: item.content })),
    { role: "user", content: message }
  ];

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.55 })
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || data.output_text || null;
}

function localAnswer(message, mode, sources) {
  const intro = {
    quick: "Here is the clearest next step:",
    creator: "Creator plan:",
    faith: "Faith-centered guidance:",
    accessibility: "Let’s make this easy:",
    nerd: "Nerd-mode breakdown:"
  }[mode] || "Here is the answer:";

  if (!sources.length) {
    return `${intro}\n\nI do not have an approved TryAMM knowledge entry for that yet. Add it to the knowledge library or connect an AI provider, and I will answer without guessing.`;
  }
  return `${intro}\n\n${sources.map((source, index) => `${index + 1}. ${source.content}`).join("\n\n")}`;
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "AMM Intelligence",
    providerConnected: Boolean(process.env.AI_API_URL && process.env.AI_API_KEY && process.env.AI_MODEL),
    africaPaymentProvider: getProvider()
  });
});

app.get("/api/knowledge", (req, res) => {
  const docs = readJson(KNOWLEDGE_FILE, []);
  res.json(docs.map(({ id, title, category, tags, modes }) => ({ id, title, category, tags, modes })));
});

app.post("/api/ai/chat", async (req, res) => {
  const message = String(req.body.message || "").trim();
  const mode = Object.hasOwn(modeInstructions, req.body.mode) ? req.body.mode : "quick";
  const history = Array.isArray(req.body.history) ? req.body.history : [];
  if (!message) return res.status(400).json({ error: "Message is required." });
  if (message.length > 4000) return res.status(400).json({ error: "Message is too long." });

  const sources = searchKnowledge(message, mode);
  try {
    const modelAnswer = await callModel({ message, mode, sources, history });
    res.json({
      answer: modelAnswer || localAnswer(message, mode, sources),
      mode,
      provider: modelAnswer ? "connected-model" : "local-knowledge",
      sources: sources.map(({ id, title, category }) => ({ id, title, category }))
    });
  } catch (error) {
    console.error(error);
    res.json({ answer: localAnswer(message, mode, sources), mode, provider: "local-fallback", sources: sources.map(({ id, title, category }) => ({ id, title, category })), warning: "The connected model was unavailable, so approved local knowledge was used." });
  }
});

app.post("/api/ai/feedback", (req, res) => {
  const record = {
    id: `fb_${Date.now()}`,
    rating: req.body.rating === "up" ? "up" : "down",
    mode: String(req.body.mode || "quick"),
    question: String(req.body.question || "").slice(0, 4000),
    answer: String(req.body.answer || "").slice(0, 8000),
    reason: String(req.body.reason || "").slice(0, 1000),
    createdAt: new Date().toISOString()
  };
  const feedback = readJson(FEEDBACK_FILE, []);
  feedback.push(record);
  writeJson(FEEDBACK_FILE, feedback.slice(-2000));
  res.status(201).json({ ok: true, id: record.id });
});

app.get("/api/content/search", (req, res) => {
  const query = String(req.query.q || "");
  const docs = searchKnowledge(query, "quick").filter((doc) => doc.category === "content");
  res.json(docs);
});

app.post("/api/payments/initialize", async (req, res, next) => {
  try {
    const payment = await initializePayment(req.body || {});
    res.status(201).json(payment);
  } catch (error) { next(error); }
});

app.post("/api/payments/payouts", async (req, res, next) => {
  try {
    if (String(req.headers["x-admin-key"] || "") !== String(process.env.ADMIN_ACTION_KEY || "")) {
      return res.status(403).json({ error: "Payout authorization failed." });
    }
    const payout = await createPayout(req.body || {});
    res.status(201).json(payout);
  } catch (error) { next(error); }
});

app.post("/api/payments/webhooks/:provider", (req, res) => {
  const provider = String(req.params.provider || "").toLowerCase();
  if (!verifyWebhook(provider, req.body, req.headers)) return res.status(401).json({ error: "Invalid webhook signature." });
  let event;
  try { event = JSON.parse(req.body.toString("utf8")); }
  catch { return res.status(400).json({ error: "Invalid webhook payload." }); }
  const events = readJson(PAYMENT_EVENTS_FILE, []);
  events.push({ provider, receivedAt: new Date().toISOString(), event });
  writeJson(PAYMENT_EVENTS_FILE, events.slice(-5000));
  res.sendStatus(200);
});

app.get("/payments/mock-success", (req, res) => {
  res.send(`<h1>Mock payment complete</h1><p>Reference: ${String(req.query.reference || "unknown")}</p><p>This page is for development only.</p>`);
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "AMM Intelligence encountered an unexpected error." });
});

app.listen(PORT, () => console.log(`AMM Intelligence running on port ${PORT}`));

"use strict";

const crypto = require("crypto");

function createMemoryRateLimiter({ windowMs = 60_000, max = 120 } = {}) {
  const buckets = new Map();
  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const current = buckets.get(key);
    if (!current || now - current.startedAt >= windowMs) {
      buckets.set(key, { startedAt: now, count: 1 });
      return next();
    }
    current.count += 1;
    if (current.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((windowMs - (now - current.startedAt)) / 1000)));
      return res.status(429).json({ error: "RATE_LIMITED", requestId: req.requestId });
    }
    return next();
  };
}

function requestContext(req, res, next) {
  const incoming = req.get("x-request-id");
  const safeIncoming = typeof incoming === "string" && /^[A-Za-z0-9._:-]{8,128}$/.test(incoming) ? incoming : null;
  req.requestId = safeIncoming || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}

function securityHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=(self), payment=(self)");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' https: data:; media-src 'self' https: blob:; connect-src 'self' https: wss:; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  next();
}

function requireJsonForWrites(req, res, next) {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();
  if (!req.is("application/json")) return res.status(415).json({ error: "JSON_REQUIRED", requestId: req.requestId });
  next();
}

function sameOriginGuard({ siteUrl }) {
  let expectedOrigin = null;
  try { expectedOrigin = new URL(siteUrl).origin; } catch { /* handled at readiness */ }
  return function guard(req, res, next) {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    if (!origin || !expectedOrigin || origin === expectedOrigin) return next();
    return res.status(403).json({ error: "ORIGIN_NOT_ALLOWED", requestId: req.requestId });
  };
}

function safeErrorHandler(err, req, res, _next) {
  console.error(JSON.stringify({
    level: "error",
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    message: err?.message || "Unhandled error"
  }));
  if (res.headersSent) return;
  res.status(500).json({ error: "INTERNAL_ERROR", requestId: req.requestId });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "NOT_FOUND", requestId: req.requestId });
}

function installProductionSecurity(app, { siteUrl, rateLimit } = {}) {
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(requestContext);
  app.use(securityHeaders);
  app.use(createMemoryRateLimiter(rateLimit));
  app.use(requireJsonForWrites);
  app.use(sameOriginGuard({ siteUrl }));
}

module.exports = {
  installProductionSecurity,
  safeErrorHandler,
  notFoundHandler,
  requestContext,
  securityHeaders,
  createMemoryRateLimiter
};

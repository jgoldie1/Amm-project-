"use strict";

const crypto = require("crypto");

function parseBearer(req) {
  const header = req.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

function createAuthMiddleware({ verifyAccessToken, loadRoles } = {}) {
  if (typeof verifyAccessToken !== "function") {
    throw new Error("verifyAccessToken function is required");
  }

  async function authenticate(req, res, next) {
    try {
      const token = parseBearer(req);
      if (!token) return res.status(401).json({ error: "AUTH_REQUIRED", requestId: req.requestId });
      const identity = await verifyAccessToken(token);
      if (!identity?.id) return res.status(401).json({ error: "INVALID_TOKEN", requestId: req.requestId });
      const roles = typeof loadRoles === "function" ? await loadRoles(identity.id, identity) : [];
      req.auth = {
        userId: identity.id,
        email: identity.email || null,
        roles: Array.isArray(roles) ? roles : [],
        sessionId: identity.sessionId || crypto.randomUUID()
      };
      return next();
    } catch (_error) {
      return res.status(401).json({ error: "INVALID_TOKEN", requestId: req.requestId });
    }
  }

  function requireRole(...allowed) {
    const wanted = new Set(allowed.flat().filter(Boolean));
    return function roleGuard(req, res, next) {
      if (!req.auth?.userId) return res.status(401).json({ error: "AUTH_REQUIRED", requestId: req.requestId });
      if (!wanted.size) return next();
      if (!req.auth.roles.some((role) => wanted.has(role))) {
        return res.status(403).json({ error: "FORBIDDEN", requestId: req.requestId });
      }
      return next();
    };
  }

  function requireSelf(param = "id") {
    return function selfGuard(req, res, next) {
      if (!req.auth?.userId) return res.status(401).json({ error: "AUTH_REQUIRED", requestId: req.requestId });
      if (String(req.params?.[param] || "") !== String(req.auth.userId)) {
        return res.status(403).json({ error: "FORBIDDEN", requestId: req.requestId });
      }
      return next();
    };
  }

  return { authenticate, requireRole, requireSelf };
}

module.exports = { createAuthMiddleware, parseBearer };

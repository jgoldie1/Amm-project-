"use strict";

function createRequireAuth({ supabase }) {
  if (!supabase) throw new Error("SUPABASE_CLIENT_REQUIRED");

  return async function requireAuth(req, res, next) {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) return res.status(401).json({ error: "AUTH_REQUIRED" });

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) return res.status(401).json({ error: "INVALID_AUTH" });

      req.user = {
        id: data.user.id,
        email: data.user.email || null,
        metadata: data.user.user_metadata || {}
      };
      next();
    } catch (error) {
      console.error("Auth middleware failed", error);
      res.status(500).json({ error: "AUTH_CHECK_FAILED" });
    }
  };
}

module.exports = { createRequireAuth };
